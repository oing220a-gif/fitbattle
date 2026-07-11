const MODEL_CAPABILITIES = {
  analysis: {
    selectorEnv: "FITCHECK_ANALYSIS_MODEL",
    legacySelectorEnv: "GEMINI_ANALYSIS_MODEL",
    defaultModel: "gemini-3.1-flash-lite",
    supportedProviders: ["gemini"],
    models: {
      "gemini-3.1-flash-lite": {
        provider: "gemini",
        model: "gemini-3.1-flash-lite",
        apiKeyEnv: "GEMINI_API_KEY"
      },
      "gemini-3.1-flash": {
        provider: "gemini",
        model: "gemini-3.1-flash",
        apiKeyEnv: "GEMINI_API_KEY"
      }
    }
  },
  imageEdit: {
    selectorEnv: "FITCHECK_IMAGE_EDIT_MODEL",
    legacySelectorEnv: "GEMINI_IMAGE_MODEL",
    defaultModel: "cloudflare:flux-2-klein-4b",
    supportedProviders: ["gemini", "cloudflare-workers-ai"],
    models: {
      "cloudflare:flux-2-klein-4b": {
        provider: "cloudflare-workers-ai",
        model: "@cf/black-forest-labs/flux-2-klein-4b",
        bindingEnv: "AI"
      },
      "cloudflare:flux-2-klein-9b": {
        provider: "cloudflare-workers-ai",
        model: "@cf/black-forest-labs/flux-2-klein-9b",
        bindingEnv: "AI"
      },
      "gemini-3.1-flash-image": {
        provider: "gemini",
        model: "gemini-3.1-flash-image",
        apiKeyEnv: "GEMINI_API_KEY"
      }
    }
  }
};

function readEnv(env, key) {
  const value = env?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function inferGeminiModel(modelKey) {
  if (/^gemini-[a-z0-9.-]+$/i.test(modelKey)) {
    return {
      provider: "gemini",
      model: modelKey,
      apiKeyEnv: "GEMINI_API_KEY"
    };
  }

  return null;
}

export function resolveModel(env, capabilityName) {
  const capability = MODEL_CAPABILITIES[capabilityName];
  if (!capability) {
    throw new Error(`Unknown model capability: ${capabilityName}`);
  }

  const requestedModel =
    readEnv(env, capability.selectorEnv) ||
    readEnv(env, capability.legacySelectorEnv) ||
    capability.defaultModel;

  const modelConfig = capability.models[requestedModel] || inferGeminiModel(requestedModel);
  if (!modelConfig) {
    throw new Error(
      `Unsupported ${capabilityName} model "${requestedModel}". ` +
      `Supported models: ${Object.keys(capability.models).join(", ")}`
    );
  }

  if (!capability.supportedProviders.includes(modelConfig.provider)) {
    throw new Error(
      `Provider "${modelConfig.provider}" is not enabled for ${capabilityName}.`
    );
  }

  return {
    key: requestedModel,
    ...modelConfig
  };
}

export function requireModelSecret(env, modelConfig) {
  if (modelConfig.apiKeyEnv && !readEnv(env, modelConfig.apiKeyEnv)) {
    throw new Error(`${modelConfig.apiKeyEnv} is not configured on the server.`);
  }

  if (modelConfig.bindingEnv && !env?.[modelConfig.bindingEnv]) {
    throw new Error(`${modelConfig.bindingEnv} binding is not configured on the server.`);
  }
}
