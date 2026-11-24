(() => {
  const config = window.ECOROUTE_SUPABASE_CONFIG;
  const projectUrl = config?.projectUrl?.trim().replace(/\/+$/, "") || "";
  const publishableKey = config?.publishableKey?.trim() || "";
  let validProjectUrl = false;

  try {
    const parsedUrl = new URL(projectUrl);
    validProjectUrl =
      parsedUrl.protocol === "https:" &&
      parsedUrl.hostname.endsWith(".supabase.co") &&
      parsedUrl.pathname === "/";
  } catch {
    validProjectUrl = false;
  }

  const isConfigured =
    validProjectUrl &&
    Boolean(publishableKey) &&
    !projectUrl.includes("YOUR_PROJECT_REF") &&
    !publishableKey.includes("YOUR_SUPABASE");

  const fetchRows = async (viewName) => {
    if (!isConfigured) {
      throw new Error("Supabase project URL and publishable/anon key are not configured.");
    }

    const response = await fetch(`${projectUrl}/rest/v1/${viewName}?select=*`, {
      headers: {
        apikey: publishableKey,
        Authorization: `Bearer ${publishableKey}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });
    const responseText = await response.text();

    if (!response.ok) {
      throw new Error(
        `Supabase ${viewName} request failed (${response.status}): ${responseText.slice(0, 240)}`,
      );
    }

    let rows;
    try {
      rows = JSON.parse(responseText);
    } catch {
      throw new Error(`Supabase ${viewName} response was not valid JSON.`);
    }
    if (!Array.isArray(rows)) {
      throw new Error(`Supabase ${viewName} response must be an array.`);
    }

    return rows;
  };

  window.ECOROUTE_SUPABASE_DATA = Object.freeze({
    isConfigured,
    getDashboardData: async () => {
      const [bins, vehicles] = await Promise.all([
        fetchRows("dashboard_bins"),
        fetchRows("dashboard_vehicles"),
      ]);
      return { bins, vehicles };
    },
  });
})();
