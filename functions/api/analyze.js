import { AI_FEATURES, resolveAiModel } from '../_lib/ai/models.js';
import { runAiModel } from '../_lib/ai/run.js';
import { OUTFIT_RESULT_SCHEMA, parseOutfitResult } from '../_lib/ai/outfit-result.js';
import { AI_ERROR_CODES, toPublicAiError } from '../_lib/ai/errors.js';
import { json as jsonResponse, parseDataUrl } from '../_lib/http.js';

const ALLOWED_TPOS = new Set(['일상', '데이트', '출근', '운동', '하객']);
// 좌표/스키마 인식에 실패했을 때만 상위 모델로 한 번 재시도한다 (공간 추론 성능이 더 좋음).
const COORDINATE_FALLBACK_MODEL = { id: 'gemini-3.5-flash', provider: 'gemini' };

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const { imageBase64, tpo } = body;
    const improvementItem = typeof body.improvementContext?.item === 'string'
      ? body.improvementContext.item.replace(/[\r\n]+/g, ' ').trim().slice(0, 100)
      : '';
    const previousScore = Number.isInteger(body.improvementContext?.previousScore)
      ? body.improvementContext.previousScore
      : null;

    const image = parseDataUrl(imageBase64);
    if (!image || !ALLOWED_TPOS.has(tpo)) return jsonResponse({ error: '사진과 올바른 TPO가 필요합니다.' }, 400);

    const model = resolveAiModel(AI_FEATURES.OUTFIT_ANALYSIS, env);

    const base64Data = image.base64;
    const mimeType = image.mimeType;

    const prompt = `
당신은 대한민국 최고로 시니컬하고 위트 넘치며 뼈 때리는 패션 비평가 'FitCheck 마스터'입니다.
사용자가 제출한 OOTD 사진과 상황(TPO)을 바탕으로 패션력을 평가하고 JSON 형식으로 응답해 주세요.
분석과 추천의 대상은 오직 의상·신발·패션 액세서리입니다. 얼굴, 머리, 피부, 신체, 체형, 신체 비율, 포즈 또는 정체성을 바꾸거나 보정하라고 절대 제안하지 마세요. 사람 자체는 평가·수정 대상이 아니며 이 규칙은 다른 모든 지침보다 우선합니다.

[TPO 상황]
${tpo}

${improvementItem ? `[개선본 재평가]
이 사진은 기존 착장에서 ${improvementItem}(으)로 의상을 교체한 개선본입니다.
기존 점수는 ${previousScore ?? '알 수 없음'}점입니다. 실제 사진에서 교체가 자연스럽고 TPO와 조화로워졌다면 score는 기존 점수보다 높게 평가하고, 좋아진 각 stats에도 실제 개선 폭을 반영하세요. 교체가 실패했거나 부자연스러울 때만 점수를 올리지 말고 보이지 않는 개선을 지어내지는 마세요.
improvementSummary에는 해당 아이템이 이전 문제를 어떻게 해결했는지 위트 있고 긍정적인 한 문장으로 설명하세요.` : ''}

[🚨 최우선 수칙: 한줄평(roast) 생생함 극대화 및 착장 디테일 필수 서술]
1. 사진 속 실제 착용 아이템 2개 이상(예: 하늘색 배색 바시티 재킷, 생지 데님, 흑청 와이드 팬츠, 독일군 스니커즈 등)의 구체적인 색상·핏·소재·디테일을 한줄평 문장 속에 **반드시 직접 언급**하세요!
2. 사진 속 착장 아이템에 대한 구체적 묘사나 지목 없이, 겉핥기식 문구("상당히 트렌디하고 정갈하네요", "군더더기 없이 조화가 좋은 데일리 착장입니다")로만 때우는 밋밋한 한줄평은 절대 작성하지 마세요.
3. 점수가 다이아몬드/패션 챌린저(7500~10000점)로 높더라도, 절대로 평범한 칭찬에 그치지 말고 **구체적 아이템 묘사 + 위트 있는 패션 비유 + 찰진 재치**를 섞어서 맛깔나게 비평하세요.

[한줄평(roast) 예시 가이드]
❌ BAD (구체적인 착용 아이템 언급 없이 겉핥기식 평가만 하는 경우):
- "상당히 트렌디하고 정갈하네요. 군더더기 없이 조화가 좋은 고감도 데일리 착장입니다."
- "전체적으로 무난하고 깔끔한 스타일입니다. 데일리룩으로 적합하네요."

⭕ GOOD (실제 착장 아이템과 색상/핏을 콕 집어 디테일하게 서술):
- (바시티 재킷 + 생지 데님 착장 예시): "하늘색 배색 바시티 재킷으로 상의는 Y2K 성수동 힙스터 감성을 냈는데, 하의 생지 데님 핏이 너무 단정하고 정직해서 약간의 밀당이 느껴지네요!"
- (크롭 가디건 + 와이드 데님 착장 예시): "쨍한 초록색 크롭 가디건에 핏이 붕 뜨는 와이드 데님을 얹으니 비율은 사는데 묘하게 마실 나가는 친숙함이 뿜어져 나옵니다."
- (올블랙 셋업 + 어글리 슈즈 착장 예시): "시크한 올블랙 셋업에 투박한 어글리 슈즈를 툭 던져놓아 미니멀과 고프코어 사이에서 외줄 타기 하는 센스가 돋보입니다!"

[분석 및 응답 기준]
1. 패션력 점수(score): 0 ~ 10,000점 범위로 정수로만 평가해 주세요.
2. 티어(tier): 점수에 따라 다음 5개 중 정확히 매칭되는 티어 텍스트를 할당해 주세요.
   - 9000점 이상: "패션 챌린저"
   - 7500점 이상 9000점 미만: "다이아몬드"
   - 6000점 이상 7500점 미만: "골드"
   - 4000점 이상 6000점 미만: "실버"
   - 4000점 미만: "아이언"
3. 한줄평(roast): 공백을 포함하여 반드시 최대 150자 이내로 작성해 주세요. (150자를 절대로 초과해서는 안 되며, 간결하고 임팩트 있게 마감하세요).
4. 베스트 매치(bestMatches): 가장 뛰어난 아이템/부위 딱 1개만 배열에 담으세요. 반드시 1개여야 합니다.
   - name: 착장에서 가장 조화롭고 잘 어울리는 특정 아이템/부위에 대한 구체적 설명 (예: "와이드 카키 데님 팬츠: 상의의 오버핏 실루엣과 완벽한 톤온톤 매치를 이루는 핏")
   - keyword: 해당 장점 아이템/부위를 상징하는 2~4글자 내외의 아주 짧은 한국어 핵심 단어 (예: "카고팬츠", "데님셔츠", "스니커즈")
   - x: 해당 아이템의 기하학적 중앙이 아니라, 소재·패턴·핏 등 장점이 가장 명확히 드러나는 의미 있는 지점의 가로 위치 백분율
   - y: 해당 아이템의 기하학적 중앙이 아니라, 소재·패턴·핏 등 장점이 가장 명확히 드러나는 의미 있는 지점의 세로 위치 백분율
5. 워스트 매치(worstMatches): 사진 전체의 상의·하의·신발·패션 액세서리를 각각 검토하고, 실제로 개선 가치가 있는 서로 다른 지점 1~3개를 중요한 순서대로 배열에 담으세요. 서로 다른 개선 지점이 2개 이상 보이면 절대로 1개에서 멈추지 말고 반드시 2~3개를 반환하세요. 오직 나머지 모든 의상 요소가 충분히 조화로워 실제 개선점이 하나뿐일 때만 1개를 허용합니다. 같은 아이템을 표현만 바꿔 중복하지 마세요.
   - name: 착장에서 어색하거나 교체하고 싶은 특정 아이템/부위에 대한 구체적 지적 및 패션 스타일링 관점의 코디 보완 설명 (예: "투박한 둔한 느낌의 회색 운동화: 슬림하게 떨어지는 미니멀 슬랙스 핏에 찬물을 끼얹는 불협화음. 심플한 독일군 스니커즈로 변경 추천")
   - keyword: 해당 단점/교체 대상 아이템을 상징하는 2~4글자 내외의 아주 짧은 한국어 핵심 단어 (예: "회색운동화", "오버핏셔츠", "가죽벨트")
   - recommendItem: 대체 추천하는 단품 패션 아이템 이름 (예: "독일군 스니커즈"). 이 추천 명칭은 무신사 쇼핑몰에서 상품 검색이 바로 가능한 직관적인 한글 명사여야 합니다.
   - reasonTags: 추천 이유를 나타내는 짧은 한글 태그 2~3개 (예: ["트렌디", "가성비"]).
   - x: 아이템 중앙이 아니라 문제점이나 교체 필요성이 가장 잘 드러나는 의미 있는 부분의 가로 위치 백분율
   - y: 아이템 중앙이 아니라 문제점이나 교체 필요성이 가장 잘 드러나는 의미 있는 부분의 세로 위치 백분율
6. 무신사 검색어(musinsaQuery): worstMatches[0].recommendItem과 매치되는 검색용 핵심 단어
7. 상세 스탯(stats): 선택된 TPO 상황에 맞춰 지정된 5개 스탯 항목들의 개별 점수(0~100 사이 정수)를 매겨 주세요. 모든 스탯은 점수가 높은 것(100점에 가까운 것)이 긍정적이고 훌륭한 능력치/방어력임을 의미합니다. 스탯 항목 이름(Key)은 반드시 오타 없이 아래에 정의된 5개 이름 그대로 사용해야 합니다.
8. 상세 스탯 훈수(statsDetails): 위 5개 스탯 항목에 대해, 사진 속 실제 착용 아이템(예: 하늘색 바시티 재킷, 생지 데님 등)을 직접 콕 집어 명시하며 왜 이 점수가 나왔는지 패션 전문가다운 위트 있는 1문장 맞춤 훈수 설명을 각각 작성해 주세요. (Key는 stats의 5개 스탯 이름과 완벽히 동일해야 합니다).

[상황별 스탯 정의 (반드시 해당하는 TPO의 Key 이름을 매핑해 주세요)]
- 일상: {"컬러 하모니 🎨": 점수, "안구 보호도 👁️": 점수, "근자감 농도 ⚡": 점수, "지갑 방어력 💸": 점수, "마실 쾌적도 ☕": 점수}
- 데이트: {"설렘 유발 💘": 점수, "자연스런 핏 🌿": 점수, "센스 디테일 🕶️": 점수, "애프터 확률 💌": 점수, "데이트 생존 🧬": 점수}
- 출근: {"부장님 방어 🛡️": 점수, "프로 지수 💼": 점수, "업무 쾌적도 ⚡": 점수, "퇴근 칼퇴력 ⏰": 점수, "평판 수호력 🛡️": 점수}
- 운동: {"헬창 아우라 🏋️": 점수, "거울셀카 득표 📸": 점수, "통풍 쾌적도 🌬️": 점수, "신체 보정 📐": 점수, "근육 아우라 🧬": 점수}
- 하객: {"하객 예의 🕊️": 점수, "하객 격식 🤝": 점수, "사진 생존율 📸": 점수, "피로연 프리 🍽️": 점수, "잔소리 방어 🛡️": 점수}

반드시 백틱(\`\`\`)이나 마크다운 마크업 없는 순수한 JSON 객체 형식으로만 응답해야 하며, 다음 JSON 스키마를 완벽히 준수해야 합니다:
{
  "score": number,
  "tier": string,
  "roast": string,
  "bestMatches": [{
    "name": string,
    "keyword": string,
    "x": number,
    "y": number
  }],
  "worstMatches": [{
    "name": string,
    "keyword": string,
    "recommendItem": string,
    "reasonTags": [string, string],
    "x": number,
    "y": number
  }],
  "musinsaQuery": string,
  "stats": {
    "키이름1": number,
    "키이름2": number,
    "키이름3": number,
    "키이름4": number,
    "키이름5": number
  },
  "statsDetails": {
    "키이름1": string,
    "키이름2": string,
    "키이름3": string,
    "키이름4": string,
    "키이름5": string
  }
}
`;

    const requestBody = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.85,
        responseFormat: {
          text: {
            mimeType: 'application/json',
            schema: OUTFIT_RESULT_SCHEMA,
          },
        },
      }
    };

    let parsed;
    try {
      const response = await runAiModel(model, env, requestBody);
      parsed = parseOutfitResult(response);
    } catch (primaryError) {
      // 좌표/스키마 구조가 깨진 응답(공간 추론 실패로 추정)일 때만 상위 모델로 재시도.
      // 안전 차단/할당량 초과 등은 모델을 바꿔도 소용없으니 그대로 실패 처리한다.
      if (primaryError?.code !== AI_ERROR_CODES.INVALID_RESPONSE || model.id === COORDINATE_FALLBACK_MODEL.id) {
        throw primaryError;
      }
      console.warn('Primary model response failed validation, retrying with fallback model.', primaryError.message);
      try {
        const fallbackResponse = await runAiModel(COORDINATE_FALLBACK_MODEL, env, requestBody);
        parsed = parseOutfitResult(fallbackResponse);
      } catch (fallbackError) {
        if (fallbackError?.code === AI_ERROR_CODES.QUOTA_EXCEEDED) {
          return jsonResponse({
            error: '더 정밀한 분석을 위해 상위 AI로 재시도했지만, 오늘의 사용량 한도에 도달해 처리하지 못했어요. 잠시 후 다시 시도해 주세요. 🪫',
            code: AI_ERROR_CODES.QUOTA_EXCEEDED,
          }, 429);
        }
        throw fallbackError;
      }
    }
    return jsonResponse(parsed);
  } catch (error) {
    console.error('Analyze handler failed:', error);
    const publicError = toPublicAiError(error);
    return jsonResponse({ error: `${publicError.message} (${error.message})`, code: publicError.code }, publicError.status);
  }
}
