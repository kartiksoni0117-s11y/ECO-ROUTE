(() => {
  const mapPage = Boolean(document.getElementById("map-vector-layer"));
  const center = [26.2183, 78.1828];
  const sectionTargets = [
    { id: "overview", match: /Gwalior Municipal Waste Logistics/i },
    { id: "route-optimization", match: /Route Optimization Benchmark/i },
    { id: "bins", match: /Priority Waste Bins/i },
    { id: "fleet", match: /Today's Active Route Manifests/i },
    { id: "analytics", match: /Gwalior Municipal Zone Clearance Rate/i },
    { id: "audit", match: /Recent Operational Activity Log/i },
  ];

  let mapInstance = null;
  let routeLayer = null;
  let tileLayer = null;
  let assetMarkers = [];
  let showRoutes = true;
  let showAssets = true;
  let activeFilter = "all";
  let applyAssetFilters = () => {};

  if (!mapPage) {
    const headings = [...document.querySelectorAll("main h1, main h2, main h3")];
    sectionTargets.forEach(({ id, match }) => {
      const heading = headings.find((item) => match.test(item.textContent));
      if (heading) {
        heading.id = id;
        heading.style.scrollMarginTop = "88px";
      }
    });
  }

  const getNavDestination = (label) => {
    if (label.includes("Overview")) return { key: "overview", href: "index.html#overview" };
    if (label.includes("Live Map") || label.includes("Live GIS Map")) {
      return { key: "map", href: "map.html" };
    }
    if (label.includes("Route Optimization")) {
      return { key: "route-optimization", href: "index.html#route-optimization" };
    }
    if (label.includes("Smart Bins") || label.includes("Waste Bins")) {
      return { key: "bins", href: "index.html#bins" };
    }
    if (label.includes("Vehicle Fleet") || label.includes("Fleet Management")) {
      return { key: "fleet", href: "index.html#fleet" };
    }
    if (label.includes("Zone Performance") || label.includes("Analytics & Reports")) {
      return { key: "analytics", href: "index.html#analytics" };
    }
    if (label.includes("Operational Audit") || label.includes("Notifications")) {
      return { key: "audit", href: "index.html#audit" };
    }
    if (label.includes("Settings")) return { key: "settings", href: "#settings" };
    return null;
  };

  const navLabels = {
    overview: "Overview",
    map: "Live Map",
    "route-optimization": "Route Optimization",
    bins: "Waste Bins",
    fleet: "Fleet Management",
    analytics: "Analytics and Reports",
    audit: "Notifications and Activity Log",
    settings: "Settings",
  };
  const dashboardNav = document.querySelectorAll("aside nav a");

  dashboardNav.forEach((link) => {
    const destination = getNavDestination(link.textContent.replace(/\s+/g, " ").trim());
    if (!destination) {
      link.removeAttribute("href");
      link.setAttribute("aria-disabled", "true");
      link.setAttribute("tabindex", "-1");
      link.setAttribute("title", "This section is not included in the supplied designs.");
      return;
    }

    link.href = destination.href;
    link.setAttribute("aria-label", navLabels[destination.key]);
    link.setAttribute("title", navLabels[destination.key]);
    link.removeAttribute("aria-disabled");
    link.removeAttribute("tabindex");

    if (destination.key === "settings") {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        document.getElementById("settings-dialog")?.showModal();
      });
    }
  });

  const updateActiveNavigation = () => {
    const activeKey = mapPage ? "map" : location.hash.slice(1) || "overview";
    dashboardNav.forEach((link) => {
      const destination = getNavDestination(link.textContent.replace(/\s+/g, " ").trim());
      if (!destination) return;
      const active = destination.key === activeKey;
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");

      if (mapPage) {
        link.classList.toggle("bg-primary-container", active);
        link.classList.toggle("text-on-primary-container", active);
        link.classList.toggle("font-semibold", active);
        link.classList.toggle("text-on-surface-variant", !active);
        link.classList.toggle("hover:bg-surface-container", !active);
        link.classList.toggle("hover:text-on-surface", !active);
      } else {
        link.classList.toggle("bg-brand-500", active);
        link.classList.toggle("text-slate-950", active);
        link.classList.toggle("font-semibold", active);
        link.classList.toggle("shadow-glow-emerald", active);
        link.classList.toggle("text-slate-400", !active);
        link.classList.toggle("hover:text-white", !active);
        link.classList.toggle("hover:bg-slate-900", !active);
      }
    });
  };
  dashboardNav.forEach((link) => {
    link.addEventListener("click", () => window.requestAnimationFrame(updateActiveNavigation));
  });
  updateActiveNavigation();
  window.addEventListener("hashchange", updateActiveNavigation);

  document.querySelectorAll("span").forEach((label) => {
    if (label.textContent.includes("All Systems Operational • GPS Live")) {
      label.textContent = mapPage
        ? "Map tiles live • Fleet data simulated"
        : "Demo telemetry • GPS not connected";
    }
    if (label.textContent.includes("GPS Uplink: 14ms")) {
      label.textContent = "Fleet telemetry simulated";
    }
    if (label.textContent.includes("Sensor Status: Sample • 9 Bin Records")) {
      label.textContent = "Demo sensors • 9 sample bin records";
    }
    if (label.textContent.includes("GPS Sync: Active")) {
      label.textContent = "GPS: Not connected";
    }
    if (label.textContent.includes("Live node telemetry")) {
      label.textContent = label.textContent.replace("Live node telemetry", "Sample telemetry");
    }
    if (label.textContent.includes("Gwalior Smart City Live Sensor Mesh")) {
      label.textContent = "Simulation Mode • sample data";
    }
  });

  if (!mapPage) {
    const normalizeText = (value) => value.replace(/\s+/g, " ").trim().toLowerCase();
    const mapCanvas = document.querySelector(".map-grid-pattern");
    const mapInspector = mapCanvas?.querySelector('[title="Close Preview"]')?.closest("div.absolute");
    const searchInput = document.querySelector(".dashboard-command-header input[type='text']");
    const priorityHeading = [...document.querySelectorAll("main h2")].find((item) =>
      item.textContent.includes("Priority Waste Bins"),
    );
    const priorityPanel = priorityHeading?.closest(".bg-white");
    const priorityList = priorityPanel?.querySelector(".overflow-y-auto");
    const priorityCards = priorityList ? [...priorityList.children] : [];
    const emptyPriorityMessage = document.createElement("div");
    emptyPriorityMessage.className = "dashboard-map-empty";
    emptyPriorityMessage.textContent = "No matching priority bins.";
    emptyPriorityMessage.hidden = true;
    priorityList?.appendChild(emptyPriorityMessage);

    const dialog = document.createElement("dialog");
    dialog.id = "dashboard-demo-dialog";
    dialog.className = "site-settings-dialog";
    dialog.innerHTML = `
      <form method="dialog">
        <header>
          <div>
            <p class="settings-eyebrow">LOCAL DEMO ONLY</p>
            <h2></h2>
          </div>
          <button class="settings-close" value="close" aria-label="Close dialog">×</button>
        </header>
        <p class="dialog-copy"></p>
        <div class="dialog-extra"></div>
        <p class="dialog-status"></p>
        <div class="dialog-actions">
          <button value="close">Close</button>
        </div>
      </form>`;
    document.body.appendChild(dialog);
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });

    const openDemoDialog = (title, copy, status, extra = []) => {
      dialog.querySelector("h2").textContent = title;
      dialog.querySelector(".dialog-copy").textContent = copy;
      dialog.querySelector(".dialog-status").textContent = status;
      const extraContent = dialog.querySelector(".dialog-extra");
      extraContent.replaceChildren(...extra);
      dialog.showModal();
      return extraContent;
    };

    const searchStatus = document.createElement("p");
    searchStatus.className = "text-[10px] text-amber-200 font-mono mt-2";
    searchStatus.setAttribute("role", "status");
    searchStatus.textContent = "Simulation Mode • map pins and telemetry are sample data.";
    if (mapInspector) {
      mapInspector.id = "dashboard-inspector";
      mapInspector.appendChild(searchStatus);
    }

    const mapVisuals = document.createElement("div");
    mapVisuals.className = "dashboard-map-visuals";
    const mapMarkers = [];
    const priorityPickupButton = mapInspector
      ? [...mapInspector.querySelectorAll("button")].find((button) =>
          button.textContent.includes("Confirm Priority Pickup"),
        )
      : null;
    const closePreviewButton = mapCanvas?.querySelector('[title="Close Preview"]');
    let activeFilter = "all";
    let activeSector = null;
    let showMapAssets = true;
    let mapScale = 1;
    let mapOffsetX = 0;
    let mapOffsetY = 0;

    if (mapCanvas && mapInspector) {
      while (mapCanvas.firstElementChild && mapCanvas.firstElementChild !== mapInspector) {
        mapVisuals.appendChild(mapCanvas.firstElementChild);
      }
      mapCanvas.insertBefore(mapVisuals, mapInspector);

      mapVisuals.querySelectorAll(".group.cursor-pointer").forEach((marker) => {
        const label = marker.textContent.replace(/\s+/g, " ").trim();
        const isFleet = /\bTRK-\d+/i.test(label);
        const type = isFleet
          ? "fleet"
          : /critical/i.test(label) || marker.querySelector(".bg-rose-500, .bg-rose-600")
            ? "critical"
            : marker.querySelector(".bg-amber-400")
              ? "medium"
              : "normal";
        const fallback = type === "critical" && !/BIN-[A-Z0-9-]+/i.test(label)
          ? "BIN-GWL-108 • Maharaj Bada Central • Lashkar Sector • 94% (Critical)"
          : "";
        const markerLabel = fallback || label;
        const data = {
          id: marker.dataset.binId || null,
          vehicleId: marker.dataset.vehicleId || null,
          element: marker,
          type,
          label: markerLabel,
          text: normalizeText(`${label} ${fallback}`),
          record: null,
          backendMissing: false,
        };
        marker.dataset.assetType = type;
        marker.setAttribute("aria-label", markerLabel || "Map marker");
        marker.setAttribute("role", "button");
        marker.setAttribute("tabindex", "0");
        mapMarkers.push(data);
      });
    }

    const setMapTransform = () => {
      if (!mapVisuals) return;
      mapVisuals.style.transform =
        `translate(${mapOffsetX}px, ${mapOffsetY}px) scale(${mapScale})`;
    };

    const sectorPatterns = [
      /lashkar|maharaj|sarafa|phool bagh/i,
      /city centre|thatipur|collectorate|junction|railway/i,
      /morar|fort/i,
    ];
    const filterButtons = [...document.querySelectorAll("main button")].filter((button) =>
      /All Bins|Critical Only|Active Fleets/i.test(button.textContent),
    );
    const sectorButtons = [...document.querySelectorAll("main button")].filter((button) =>
      /^(Lashkar & Maharaj Bada|City Centre & Thatipur|Morar Sector)/i.test(button.textContent.trim()),
    );
    const filterName = (button) => {
      const label = button.textContent.trim();
      if (/Critical Only/i.test(label)) return "critical";
      if (/Active Fleets/i.test(label)) return "fleet";
      return "all";
    };
    const syncFilterButtons = () => {
      filterButtons.forEach((button) => {
        const selected = filterName(button) === activeFilter;
        button.setAttribute("aria-pressed", String(selected));
        button.classList.toggle("ring-2", selected);
        button.classList.toggle("ring-emerald-400", selected);
        button.classList.toggle("ring-offset-1", selected);
      });
    };
    const syncSectorButtons = (selectedIndex) => {
      sectorButtons.forEach((button, index) => {
        const selected = index === selectedIndex;
        button.setAttribute("aria-pressed", String(selected));
        button.classList.toggle("bg-white", selected);
        button.classList.toggle("text-slate-900", selected);
        button.classList.toggle("shadow-sm", selected);
        button.classList.toggle("text-slate-600", !selected);
      });
    };

    const applyDashboardFilters = () => {
      const query = normalizeText(searchInput?.value || "");
      let visiblePriorityCount = 0;

      mapMarkers.forEach(({ element, type, text, backendMissing }) => {
        const typeMatches =
          activeFilter === "all" ||
          (activeFilter === "critical" && type === "critical") ||
          (activeFilter === "fleet" && type === "fleet");
        const queryMatches = !query || text.includes(query);
        const sectorMatches = !activeSector || activeSector.test(text);
        element.hidden =
          backendMissing || !(showMapAssets && typeMatches && queryMatches && sectorMatches);
      });

      priorityCards.forEach((card) => {
        const text = normalizeText(card.textContent);
        const queryMatches = !query || text.includes(query);
        const sectorMatches = !activeSector || activeSector.test(text);
        card.hidden =
          card.dataset.backendMissing === "true" || !(queryMatches && sectorMatches);
        if (!card.hidden) visiblePriorityCount += 1;
      });
      emptyPriorityMessage.hidden = !priorityCards.length || visiblePriorityCount > 0;
    };

    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        activeFilter = filterName(button);
        syncFilterButtons();
        applyDashboardFilters();
      });
    });

    sectorButtons.forEach((button, index) => {
      button.addEventListener("click", () => {
        activeSector = sectorPatterns[index];
        syncSectorButtons(index);
        applyDashboardFilters();
      });
    });
    syncFilterButtons();
    syncSectorButtons(0);

    searchInput?.setAttribute("aria-label", "Search bins, vehicles, and landmarks");
    searchInput?.addEventListener("input", applyDashboardFilters);
    document.addEventListener("keydown", (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInput?.focus();
      }
    });
    applyDashboardFilters();

    const routesCheckbox = [...document.querySelectorAll("main label")].find((label) =>
      label.textContent.includes("Show Optimized Paths"),
    )?.querySelector('input[type="checkbox"]');
    const routePaths = mapVisuals.querySelectorAll("svg path[stroke-dasharray]");
    routesCheckbox?.setAttribute("aria-label", "Show optimized sample routes");
    routesCheckbox?.addEventListener("change", () => {
      routePaths.forEach((path) => {
        path.style.display = routesCheckbox.checked ? "" : "none";
      });
    });

    const inspectorId = mapInspector?.querySelector(".font-mono.font-bold.text-sm");
    const inspectorPlace = mapInspector?.querySelector("span.text-slate-300.font-sans");
    const inspectorBadge = mapInspector
      ? [...mapInspector.querySelectorAll("span")].find((span) =>
          span.classList.contains("px-1.5") && span.textContent.includes("%"),
        )
      : null;
    const inspectorFill = mapInspector?.querySelector(".bg-gradient-to-r");
    const sensorGrid = mapInspector?.querySelector(".grid.grid-cols-2");
    const inspectorOverflow = mapInspector?.querySelector(
      ".my-3 .flex.justify-between.items-center.text-xs > span:last-child",
    );
    const inspectorAssignment = [...(mapInspector?.querySelectorAll("span") || [])].find((span) =>
      span.textContent.trim().startsWith("Assigned:"),
    );
    const inspectorDriver = [...(mapInspector?.querySelectorAll("span") || [])].find((span) =>
      span.textContent.trim().startsWith("Driver:"),
    );
    const inspectorVehicleEta = [...(mapInspector?.querySelectorAll("span") || [])].find((span) =>
      span.textContent.trim().startsWith("ETA "),
    );
    const inspectorVehicleDistance = [...(mapInspector?.querySelectorAll("span") || [])].find((span) =>
      span.textContent.trim().endsWith("km away"),
    );
    const inspectorStatusPing = mapInspector?.querySelector(
      ".flex.items-start.justify-between .animate-ping",
    );
    const inspectorStatusDot = mapInspector?.querySelector(
      ".flex.items-start.justify-between .relative.inline-flex.rounded-full",
    );
    const binSampleDetails = {
      "BIN-GWL-108": {
        overflowEta: "25 mins",
        vehicle: "Compactor TRK-01",
        driver: "Rajesh Yadav",
        vehicleEta: "8 mins",
        distance: "0.7 km away",
      },
      "BIN-GWL-518": { overflowEta: "Imminent" },
      "BIN-GWL-402": { vehicle: "TRK-04 EV", vehicleEta: "14 mins" },
    };
    const statusIndicatorColors = {
      critical: { border: "border-rose-500/40", ping: "bg-rose-400", dot: "bg-rose-500" },
      medium: { border: "border-amber-500/40", ping: "bg-amber-400", dot: "bg-amber-500" },
      high: { border: "border-amber-500/40", ping: "bg-amber-400", dot: "bg-amber-500" },
      normal: { border: "border-emerald-500/40", ping: "bg-emerald-400", dot: "bg-emerald-500" },
    };
    const fillStyles = {
      critical: { badge: "bg-rose-500/20 text-rose-300 border-rose-500/40", bar: "bg-rose-500" },
      medium: { badge: "bg-amber-500/20 text-amber-300 border-amber-500/40", bar: "bg-amber-400" },
      high: { badge: "bg-amber-500/20 text-amber-300 border-amber-500/40", bar: "bg-amber-400" },
      normal: { badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40", bar: "bg-emerald-500" },
    };

    const showBinPreview = (markerData) => {
      const record = markerData.record;
      const match = markerData.label.match(/(BIN-[A-Z0-9-]+)\s*•\s*(.*?)\s*•\s*(\d+)%\s*\((.*?)\)/i);
      mapInspector.hidden = false;
      const id = record?.id || match?.[1] || "Sample bin";
      const location = record?.location_label || match?.[2] || "Location not provided";
      const sector = record?.sector;
      const place =
        sector && !location.toLowerCase().includes(sector.toLowerCase())
          ? `${location} • ${sector}`
          : location;
      const fill = record ? String(Math.round(record.fill_percent)) : match?.[3] || "0";
      const status = record
        ? record.severity.charAt(0).toUpperCase() + record.severity.slice(1)
        : match?.[4] || "Normal";
      const normalizedStatus = status.toLowerCase();
      const colors = fillStyles[normalizedStatus] || fillStyles.normal;
      const indicatorColors = statusIndicatorColors[normalizedStatus] || statusIndicatorColors.normal;
      const details = record
        ? {
            overflowEta: record.overflow_eta_text,
            vehicle: record.assigned_vehicle_id
              ? record.assigned_vehicle_type?.toLowerCase().includes("electric")
                ? `${record.assigned_vehicle_id} EV`
                : `Compactor ${record.assigned_vehicle_id}`
              : null,
            driver: record.assigned_driver_name,
            vehicleEta:
              record.assigned_vehicle_eta_minutes == null
                ? null
                : `${record.assigned_vehicle_eta_minutes} mins`,
            distance:
              record.distance_km == null
                ? null
                : `${Number(record.distance_km).toFixed(1)} km away`,
          }
        : binSampleDetails[id] || {};
      if (inspectorId) inspectorId.textContent = id;
      if (inspectorPlace) inspectorPlace.textContent = place;
      if (inspectorBadge) {
        inspectorBadge.textContent = `${fill}% ${status.toUpperCase()}`;
        inspectorBadge.className =
          `px-1.5 py-0.2 rounded text-[9px] font-mono font-extrabold border ${colors.badge}`;
      }
      if (inspectorFill) {
        inspectorFill.className = `h-full rounded-full ${colors.bar}`;
        inspectorFill.style.width = `${fill}%`;
      }
      if (inspectorOverflow) {
        inspectorOverflow.textContent = `Overflow ETA: ${details.overflowEta || "Not provided"}`;
      }
      if (sensorGrid) {
        [...sensorGrid.children].forEach((cell, index) => {
          cell.textContent = [
            `Sensor Status: ${record?.sensor_status || "Simulated"}`,
            `Fill Level: ${fill}%`,
            `Data Source: ${record?.source || "Sample"}`,
            "GPS: Not connected",
          ][index];
        });
      }
      if (inspectorAssignment) {
        inspectorAssignment.textContent = `Assigned: ${details.vehicle || "No sample assignment"}`;
      }
      if (inspectorDriver) {
        inspectorDriver.textContent = `Driver: ${details.driver || "Not listed"}`;
      }
      if (inspectorVehicleEta) {
        inspectorVehicleEta.textContent = `ETA ${details.vehicleEta || "Not available"}`;
      }
      if (inspectorVehicleDistance) {
        inspectorVehicleDistance.textContent = details.distance || "Distance not provided";
      }
      mapInspector.classList.remove(
        "border-rose-500/40",
        "border-amber-500/40",
        "border-emerald-500/40",
      );
      mapInspector.classList.add(indicatorColors.border);
      inspectorStatusPing?.classList.remove("bg-rose-400", "bg-amber-400", "bg-emerald-400");
      inspectorStatusPing?.classList.add(indicatorColors.ping);
      inspectorStatusDot?.classList.remove("bg-rose-500", "bg-amber-500", "bg-emerald-500");
      inspectorStatusDot?.classList.add(indicatorColors.dot);
      searchStatus.textContent =
        record
          ? record.source === "demo"
            ? "Database demo record • sensor readings are simulated; GPS is not connected."
            : `Database record • source: ${record.source}; GPS is not connected.`
          : "Simulation Mode • sample map preview; sensor readings and GPS are not live.";
    };

    mapMarkers.forEach((markerData) => {
      markerData.element.addEventListener("click", () => {
        if (markerData.type === "fleet") {
          openDemoDialog(
            "Fleet location preview",
            markerData.element.textContent.replace(/\s+/g, " ").trim(),
            "Simulation Mode • sample vehicle position only; GPS is not connected.",
          );
          return;
        }
        showBinPreview(markerData);
      });
      markerData.element.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          markerData.element.click();
        }
      });
    });

    closePreviewButton?.addEventListener("click", () => {
      mapInspector.hidden = true;
    });

    priorityPickupButton?.addEventListener("click", () => {
      searchStatus.textContent =
        "Demo action recorded locally only; no pickup was dispatched and no vehicle was notified.";
      priorityPickupButton.querySelector("span:last-child").textContent = "Demo Pickup Recorded";
      priorityPickupButton.disabled = true;
      window.setTimeout(() => {
        priorityPickupButton.querySelector("span:last-child").textContent = "Confirm Priority Pickup";
        priorityPickupButton.disabled = false;
      }, 3000);
    });

    const zoomIn = mapCanvas?.querySelector('[title="Zoom In"]');
    const zoomOut = mapCanvas?.querySelector('[title="Zoom Out"]');
    const recenter = mapCanvas?.querySelector('[title="Center Maharaj Bada"]');
    const layerSwitch = mapCanvas?.querySelector('[title="Layer Switch"]');
    const zoomMap = (nextScale) => {
      const boundedScale = Math.min(2.2, Math.max(1, nextScale));
      const ratio = boundedScale / mapScale;
      mapOffsetX = mapCanvas.clientWidth / 2 - (mapCanvas.clientWidth / 2 - mapOffsetX) * ratio;
      mapOffsetY = mapCanvas.clientHeight / 2 - (mapCanvas.clientHeight / 2 - mapOffsetY) * ratio;
      mapScale = boundedScale;
      setMapTransform();
    };
    zoomIn?.addEventListener("click", () => zoomMap(mapScale + 0.2));
    zoomOut?.addEventListener("click", () => zoomMap(mapScale - 0.2));

    recenter?.addEventListener("click", () => {
      activeFilter = "all";
      activeSector = null;
      if (searchInput) searchInput.value = "";
      syncFilterButtons();
      syncSectorButtons(0);
      applyDashboardFilters();
      const centerMarker = mapMarkers.find((marker) => marker.text.includes("bin-gwl-108"));
      if (centerMarker) {
        const canvasRect = mapCanvas.getBoundingClientRect();
        const markerRect = centerMarker.element.getBoundingClientRect();
        const markerX = (markerRect.left + markerRect.width / 2 - canvasRect.left - mapOffsetX) / mapScale;
        const markerY = (markerRect.top + markerRect.height / 2 - canvasRect.top - mapOffsetY) / mapScale;
        mapScale = 1;
        mapOffsetX = mapCanvas.clientWidth / 2 - markerX;
        mapOffsetY = mapCanvas.clientHeight / 2 - markerY;
        setMapTransform();
      } else {
        mapScale = 1;
        mapOffsetX = 0;
        mapOffsetY = 0;
        setMapTransform();
      }
    });

    const mapSvg = mapVisuals.querySelector("svg");
    const streetLayers = mapSvg
      ? mapSvg.querySelectorAll('g[stroke="#334155"], g[stroke="#475569"]')
      : [];
    const mapLabels = [...mapVisuals.children].filter(
      (element) => element !== mapSvg && !element.classList.contains("group"),
    );
    let detailedLayerVisible = true;
    layerSwitch?.setAttribute("aria-pressed", "true");
    layerSwitch?.setAttribute("aria-label", "Toggle street and landmark layer");
    layerSwitch?.addEventListener("click", () => {
      detailedLayerVisible = !detailedLayerVisible;
      streetLayers.forEach((layer) => {
        layer.style.display = detailedLayerVisible ? "" : "none";
      });
      mapLabels.forEach((label) => {
        label.style.display = detailedLayerVisible ? "" : "none";
      });
      layerSwitch.setAttribute("aria-pressed", String(detailedLayerVisible));
    });

    const sortPriorityButton = document.querySelector('[title="Sort Priority"]');
    let sortDescending = true;
    sortPriorityButton?.setAttribute("aria-pressed", "true");
    sortPriorityButton?.addEventListener("click", () => {
      sortDescending = !sortDescending;
      const sorted = [...priorityCards].sort((first, second) => {
        const firstFill = Number(first.textContent.match(/(\d+)%/)?.[1] || 0);
        const secondFill = Number(second.textContent.match(/(\d+)%/)?.[1] || 0);
        return sortDescending ? secondFill - firstFill : firstFill - secondFill;
      });
      sorted.forEach((card) => priorityList.insertBefore(card, emptyPriorityMessage));
      sortPriorityButton.setAttribute("aria-pressed", String(sortDescending));
      sortPriorityButton.title = sortDescending ? "Sort by highest priority first" : "Sort by lowest priority first";
    });

    const sidebarToggle = document.querySelector('aside button[title="Toggle Navigation"]');
    const isNarrow = () => window.matchMedia("(max-width: 760px)").matches;
    sidebarToggle?.setAttribute("aria-expanded", String(!isNarrow()));
    sidebarToggle?.addEventListener("click", () => {
      if (isNarrow()) {
        document.body.classList.toggle("dashboard-sidebar-expanded");
        sidebarToggle.setAttribute(
          "aria-expanded",
          String(document.body.classList.contains("dashboard-sidebar-expanded")),
        );
      } else {
        document.body.classList.toggle("dashboard-sidebar-collapsed");
        sidebarToggle.setAttribute(
          "aria-expanded",
          String(!document.body.classList.contains("dashboard-sidebar-collapsed")),
        );
      }
    });

    const settingsButton = document.querySelector('aside button[title="Settings"]');
    settingsButton?.addEventListener("click", () => {
      const message = "Dashboard preferences affect this page only. Sensor, vehicle, and route values remain sample data.";
      const status = "Simulation Mode • no hardware, live GPS, or municipal systems are connected.";
      const extra = openDemoDialog("Dashboard settings", message, status);
      [
        { label: "Show optimized sample paths", checked: routesCheckbox?.checked ?? true },
        { label: "Show demo bins and vehicles", checked: showMapAssets },
      ].forEach(({ label, checked }, index) => {
        const setting = document.createElement("label");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = checked;
        setting.append(checkbox, document.createTextNode(label));
        checkbox.addEventListener("change", () => {
          if (index === 0 && routesCheckbox) {
            routesCheckbox.checked = checkbox.checked;
            routesCheckbox.dispatchEvent(new Event("change"));
          } else if (index === 1) {
            showMapAssets = checkbox.checked;
            applyDashboardFilters();
          }
        });
        extra.appendChild(setting);
      });
    });

    const simulationButton = [...document.querySelectorAll(".dashboard-command-header button")].find((button) =>
      button.textContent.includes("Sim Parameters"),
    );
    simulationButton?.addEventListener("click", () => {
      const selectedIndex = sectorPatterns.indexOf(activeSector);
      const zoneLabel = document.createElement("label");
      zoneLabel.className = "dialog-zone";
      zoneLabel.textContent = "Demo region";
      const zoneSelect = document.createElement("select");
      zoneSelect.className = "dialog-select";
      zoneSelect.setAttribute("aria-label", "Choose demo region");
      [
        ["all", "All Gwalior zones"],
        ["0", "Lashkar & Maharaj Bada"],
        ["1", "City Centre & Thatipur"],
        ["2", "Morar Sector"],
      ].forEach(([value, label]) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = label;
        zoneSelect.appendChild(option);
      });
      zoneSelect.value = selectedIndex < 0 ? "all" : String(selectedIndex);
      zoneSelect.addEventListener("change", () => {
        const index = zoneSelect.value === "all" ? -1 : Number(zoneSelect.value);
        activeSector = index < 0 ? null : sectorPatterns[index];
        syncSectorButtons(index);
        applyDashboardFilters();
      });
      zoneLabel.appendChild(zoneSelect);
      openDemoDialog(
        "Simulation parameters",
        "Choose which zone's sample bins and landmarks are shown in the dashboard.",
        "Changes are local to this page; no live GPS, dispatch, or route service is connected.",
        [zoneLabel],
      );
    });

    [...document.querySelectorAll("main button")].forEach((button) => {
      const label = normalizeText(button.textContent);
      if (label.includes("viva demonstration pdf")) {
        button.setAttribute("aria-label", "Print dashboard or save it as a PDF");
        button.addEventListener("click", () => window.print());
      }
      if (label.includes("stream details")) {
        button.addEventListener("click", () => {
          const card = button.closest(".bg-white");
          const rows = card
            ? [...card.querySelectorAll(".flex.justify-between.items-center")]
                .map((row) => row.textContent.replace(/\s+/g, " ").trim())
                .filter(Boolean)
            : [];
          const extra = rows.map((row) => {
            const item = document.createElement("p");
            item.className = "dialog-copy";
            item.textContent = row;
            return item;
          });
          openDemoDialog(
            "Waste stream details",
            "The dashboard values below are illustrative sample data, not a live audit.",
            "Local display only • no external waste-management system is connected.",
            extra,
          );
        });
      }
      if (label.includes("track gps")) {
        button.setAttribute("aria-label", "Open a simulated GPS preview for TRK-01");
        button.addEventListener("click", () => {
          window.location.href = "map.html?asset=TRK-01&demo=1";
        });
      }
      if (label.includes("in-cab hud")) {
        button.addEventListener("click", () => {
          const route = button.closest(".p-4");
          const routeText = route?.textContent.replace(/\s+/g, " ").trim() || "Route details unavailable.";
          openDemoDialog(
            "In-cab HUD preview",
            routeText,
            "Demo preview only • no vehicle display or hardware connection is active.",
          );
        });
      }
      if (label.includes("re-calculate")) {
        button.addEventListener("click", () => {
          const optimizer = document.getElementById("optimizeHeaderBtn");
          optimizer?.click();
          searchStatus.textContent =
            "Simulation Mode • sample route refresh requested; no real vehicle route was changed.";
        });
      }
      if (label.includes("export activity log")) {
        button.setAttribute("aria-label", "Download activity log as CSV");
        button.addEventListener("click", () => {
          const heading = [...document.querySelectorAll("main h2")].find((item) =>
            item.textContent.includes("Recent Operational Activity Log"),
          );
          const log = heading?.closest("section")?.querySelector(".divide-y");
          const rows = [...(log?.children || [])].map((row) => {
            const content = row.querySelector(".flex.flex-col.min-w-0");
            const event = content?.children[0]?.textContent.replace(/\s+/g, " ").trim() || "";
            const details = content?.children[1]?.textContent.replace(/\s+/g, " ").trim() || "";
            const timestamp = row.lastElementChild?.textContent.trim() || "";
            return [timestamp, event, details];
          });
          const escapeCsv = (value) => `"${String(value).replace(/"/g, '""')}"`;
          const csv = [["Timestamp", "Event", "Details"], ...rows]
            .map((row) => row.map(escapeCsv).join(","))
            .join("\r\n");
          const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
          const download = document.createElement("a");
          download.href = url;
          download.download = "ecoroute-activity-log.csv";
          document.body.appendChild(download);
          download.click();
          download.remove();
          window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        });
      }
    });

    document.querySelectorAll("button").forEach((button) => {
      if (
        button.dataset.action === "open-simulated-map" ||
        /view all .* bins in map/i.test(button.textContent.replace(/\s+/g, " "))
      ) {
        button.addEventListener("click", () => {
          window.location.href = "map.html?filter=critical";
        });
      }
    });

    const sourceStatus = document.querySelector("[data-dashboard-source-status]");
    const sourceStatusContainer = sourceStatus?.closest("div");
    const sourceStatusIndicator = sourceStatusContainer?.querySelector(".rounded-full");
    const setDashboardSourceStatus = (message, state, details = "") => {
      if (!sourceStatus) return;
      sourceStatus.textContent = message;
      sourceStatus.title = details;
      const stateClasses = {
        demo: ["bg-amber-50", "border-amber-200", "text-amber-800", "bg-amber-500"],
        loading: ["bg-amber-50", "border-amber-200", "text-amber-800", "bg-amber-500"],
        connected: ["bg-emerald-50", "border-emerald-200", "text-emerald-800", "bg-emerald-500"],
        error: ["bg-rose-50", "border-rose-200", "text-rose-800", "bg-rose-500"],
      };
      const allStateClasses = [
        "bg-amber-50",
        "border-amber-200",
        "text-amber-800",
        "bg-emerald-50",
        "border-emerald-200",
        "text-emerald-800",
        "bg-rose-50",
        "border-rose-200",
        "text-rose-800",
      ];
      sourceStatusContainer?.classList.remove(...allStateClasses);
      sourceStatusContainer?.classList.add(...stateClasses[state].slice(0, 3));
      sourceStatusIndicator?.classList.remove("bg-amber-500", "bg-emerald-500", "bg-rose-500");
      sourceStatusIndicator?.classList.add(stateClasses[state][3]);
    };

    const fetchLocalRows = async (endpoint) => {
      const response = await fetch(`http://127.0.0.1:3000/api/${endpoint}`, {
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error(`Local backend ${endpoint} request failed (${response.status}).`);
      }
      const rows = await response.json();
      if (!Array.isArray(rows)) {
        throw new Error(`Local backend ${endpoint} response must be an array.`);
      }
      return rows;
    };

    setDashboardSourceStatus("Loading local backend sample records…", "loading");
    Promise.all([fetchLocalRows("bins"), fetchLocalRows("vehicles")])
      .then(([bins, vehicles]) => {
        const validSeverities = new Set(["normal", "medium", "high", "critical"]);
        const recordsById = new Map();
        bins.forEach((row) => {
          if (!row) {
            throw new Error("Local backend returned an empty bin record.");
          }
          const fill = Number(row.fill_percent);
          if (
            typeof row.id !== "string" ||
            !row.id ||
            typeof row.location_label !== "string" ||
            !Number.isFinite(fill) ||
            fill < 0 ||
            fill > 100 ||
            !validSeverities.has(row.severity)
          ) {
            throw new Error("Local backend returned a bin record with invalid required fields.");
          }
          if (recordsById.has(row.id)) {
            throw new Error(`Local backend returned duplicate bin ID ${row.id}.`);
          }
          row.fill_percent = fill;
          recordsById.set(row.id, row);
        });
        const validVehicleStatuses = new Set([
          "active",
          "idle",
          "maintenance",
          "inactive",
        ]);
        if (
          vehicles.some(
            (vehicle) =>
              !vehicle ||
              typeof vehicle.id !== "string" ||
              !validVehicleStatuses.has(vehicle.status),
          )
        ) {
          throw new Error("Local backend returned a vehicle record without a valid ID.");
        }
        const activeVehiclesById = new Map(
          vehicles
            .filter((vehicle) => vehicle.status === "active")
            .map((vehicle) => [vehicle.id, vehicle]),
        );
        mapMarkers.forEach((markerData) => {
          if (!markerData.vehicleId) return;
          markerData.record = activeVehiclesById.get(markerData.vehicleId) || null;
          markerData.backendMissing = !markerData.record;
        });

        const markerStyles = {
          normal: ["bg-emerald-500", "ring-emerald-500/25", "bg-emerald-400"],
          medium: ["bg-amber-400", "ring-amber-400/30", "bg-amber-400"],
          high: ["bg-amber-400", "ring-amber-400/30", "bg-amber-400"],
          critical: ["bg-rose-500", "ring-rose-500/30", "bg-rose-400"],
        };
        mapMarkers.forEach((markerData) => {
          if (!markerData.id) return;
          const record = recordsById.get(markerData.id);
          markerData.record = record || null;
          markerData.backendMissing = !record;
          if (!record) return;

          markerData.type = record.severity;
          const place =
            record.sector && !record.location_label.toLowerCase().includes(record.sector.toLowerCase())
              ? `${record.location_label} • ${record.sector}`
              : record.location_label;
          const severity =
            record.severity.charAt(0).toUpperCase() + record.severity.slice(1);
          markerData.label =
            `${record.id} • ${place} • ${Math.round(record.fill_percent)}% (${severity})`;
          markerData.text = normalizeText(`${markerData.label} ${record.name} ${record.sector || ""}`);
          markerData.element.dataset.assetType = record.severity;
          markerData.element.setAttribute("aria-label", markerData.label);
          const tooltip = markerData.element.querySelector("[data-bin-tooltip]");
          if (tooltip) tooltip.textContent = markerData.label;

          const [background, ring, pulse] = markerStyles[record.severity];
          const dot = markerData.element.querySelector("[data-bin-marker]");
          if (dot) {
            dot.classList.remove(
              "bg-emerald-500",
              "bg-amber-400",
              "bg-rose-500",
              "bg-rose-600",
              "ring-emerald-500/25",
              "ring-amber-400/30",
              "ring-rose-500/30",
            );
            dot.classList.add(background, ring);
          }
          const ping = markerData.element.querySelector(".animate-ping");
          if (ping) {
            ping.classList.remove("bg-emerald-500", "bg-amber-400", "bg-rose-500");
            ping.classList.add(pulse);
          }
        });

        const badgeStyles = {
          normal: "bg-emerald-100 text-emerald-800 border border-emerald-200",
          medium: "bg-amber-100 text-amber-800 border border-amber-200",
          high: "bg-amber-100 text-amber-800 border border-amber-200",
          critical: "bg-rose-100 text-rose-700 border border-rose-200",
        };
        const barStyles = {
          normal: "bg-emerald-500",
          medium: "bg-amber-400",
          high: "bg-amber-500",
          critical: "bg-rose-500",
        };
        priorityCards.forEach((card) => {
          const record = recordsById.get(card.dataset.binId);
          const isPriority = record && ["high", "critical"].includes(record.severity);
          card.dataset.backendMissing = String(!isPriority);
          if (!record) return;

          const badge = card.querySelector("[data-bin-fill-status]");
          if (badge) {
            const style =
              record.id === "BIN-GWL-108"
                ? "bg-rose-500/30 text-rose-300 border border-rose-500/40"
                : record.id === "BIN-GWL-402"
                  ? "bg-rose-200/80 text-rose-900"
                  : badgeStyles[record.severity];
            badge.className =
              `px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${style}`;
            badge.textContent =
              `${Math.round(record.fill_percent)}% ${record.severity.toUpperCase()}`;
          }
          const fillBar = card.querySelector("[data-bin-fill-bar]");
          if (fillBar) {
            fillBar.classList.remove(
              "bg-emerald-500",
              "bg-amber-400",
              "bg-amber-500",
              "bg-rose-500",
              "bg-rose-600",
            );
            fillBar.classList.add(barStyles[record.severity]);
            fillBar.style.width = `${record.fill_percent}%`;
          }
          const assignment = card.querySelector("[data-bin-assignment]");
          if (assignment) {
            const label = record.assigned_vehicle_id
              ? record.assigned_vehicle_eta_minutes == null
                ? `${record.assigned_vehicle_id} (Next Stop in Circuit)`
                : `Assigned to ${record.assigned_vehicle_id} • ETA ${record.assigned_vehicle_eta_minutes} mins`
              : "No vehicle assigned";
            const icon = assignment.querySelector(".material-symbols-outlined");
            if (icon) assignment.replaceChildren(icon, document.createTextNode(` ${label}`));
            else assignment.textContent = label;
          }
        });

        const dashboardPriorityCount = bins.filter((bin) =>
          ["high", "critical"].includes(bin.severity),
        ).length;
        const dashboardOverflowCount = bins.filter((bin) => bin.fill_percent >= 85).length;
        const visibleMapBins = mapMarkers.filter((marker) => marker.id && marker.record);
        const dashboardCriticalMapCount = visibleMapBins.filter(
          (marker) => marker.record.severity === "critical",
        ).length;
        const activeVehicleCount = vehicles.filter(
          (vehicle) => vehicle.status === "active",
        ).length;
        const setMetric = (name, value) => {
          document
            .querySelectorAll(`[data-dashboard-metric="${name}"]`)
            .forEach((element) => {
              element.textContent = String(value);
            });
        };
        setMetric("bin-count", bins.length);
        setMetric("overflow-count", dashboardOverflowCount);
        setMetric("priority-count", dashboardPriorityCount);
        setMetric("vehicle-count", activeVehicleCount);
        document
          .querySelectorAll('[data-dashboard-map-count="all"]')
          .forEach((element) => {
            element.textContent = String(visibleMapBins.length);
          });
        document
          .querySelectorAll('[data-dashboard-map-count="critical"]')
          .forEach((element) => {
            element.textContent = String(dashboardCriticalMapCount);
          });
        document
          .querySelectorAll('[data-dashboard-map-count="vehicles"]')
          .forEach((element) => {
            element.textContent = String(activeVehicleCount);
          });

        applyDashboardFilters();
        const selectedMarker = mapMarkers.find(
          (marker) => marker.id === inspectorId?.textContent.trim() && marker.record,
        );
        if (selectedMarker && !mapInspector.hidden) showBinPreview(selectedMarker);
        setDashboardSourceStatus(
          `Local backend connected • ${bins.length} bins and ${activeVehicleCount} vehicles`,
          "connected",
        );
      })
      .catch((error) => {
        console.error("Could not load EcoRoute dashboard records from the local backend.", error);
        setDashboardSourceStatus(
          "Local backend unavailable • demo records shown",
          "error",
          error instanceof Error ? error.message : String(error),
        );
      });

    if (location.hash) {
      requestAnimationFrame(() => {
        document.getElementById(location.hash.slice(1))?.scrollIntoView();
      });
    }
    return;
  }

  document.title = "EcoRoute Gwalior | Live City Map";
  const mapStage = document.getElementById("map-vector-layer").parentElement;
  const searchParams = new URLSearchParams(location.search);
  const focusAsset = searchParams.get("asset");
  const requestedFilter = searchParams.get("filter");
  if (["all", "critical", "filling", "normal", "trucks"].includes(requestedFilter)) {
    activeFilter = requestedFilter;
  }
  const mapStatus = document.createElement("span");
  mapStatus.className =
    "px-space-sm py-1 rounded-full bg-amber-100 text-amber-800 font-label-sm text-label-sm";
  mapStatus.id = "map-live-status";
  mapStatus.setAttribute("role", "status");
  mapStatus.textContent = "Loading Gwalior map tiles…";

  const filterToolbar = document.querySelector('[data-filter="all"]')?.parentElement?.parentElement;
  if (filterToolbar) filterToolbar.appendChild(mapStatus);

  const settingsDialog = document.createElement("dialog");
  settingsDialog.id = "settings-dialog";
  settingsDialog.className = "site-settings-dialog";
  settingsDialog.innerHTML = `
    <form method="dialog">
      <header>
        <div>
          <p class="settings-eyebrow">ECOROUTE</p>
          <h2>Map settings</h2>
        </div>
        <button class="settings-close" value="close" aria-label="Close settings">×</button>
      </header>
      <label><input id="settings-routes" type="checkbox" checked> Show optimized routes</label>
      <label><input id="settings-assets" type="checkbox" checked> Show demo bins and vehicles</label>
      <button id="settings-recenter" class="settings-recenter" type="button">Center map on Gwalior</button>
    </form>`;
  document.body.appendChild(settingsDialog);
  settingsDialog.querySelector("#settings-routes").addEventListener("change", (event) => {
    showRoutes = event.currentTarget.checked;
    syncRouteLayer();
  });
  settingsDialog.querySelector("#settings-assets").addEventListener("change", (event) => {
    showAssets = event.currentTarget.checked;
    applyAssetFilters();
  });
  settingsDialog.querySelector("#settings-recenter").addEventListener("click", () => {
    if (mapInstance) mapInstance.flyTo(center, 13);
    settingsDialog.close();
  });

  const setMapStatus = (message) => {
    mapStatus.textContent = message;
  };

  const loadLeaflet = () =>
    new Promise((resolve, reject) => {
      const css = document.createElement("link");
      css.rel = "stylesheet";
      css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      css.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
      css.crossOrigin = "anonymous";
      document.head.appendChild(css);

      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
      script.crossOrigin = "anonymous";
      script.onload = () => {
        if (window.L) resolve(window.L);
        else reject(new Error("Leaflet loaded without its map API."));
      };
      script.onerror = () => reject(new Error("Could not load Leaflet from unpkg.com."));
      document.head.appendChild(script);
    });

  const binAssets = [
    {
      id: "BIN-1042",
      type: "critical",
      fill: 92,
      name: "Maharaj Bada Gate 3",
      place: "Maharaj Bada",
      coordinates: [26.2023, 78.1573],
      overflow: "~42 min",
      depth: "14 cm",
      vehicle: "TRK-01 • ETA 11 min",
    },
    {
      id: "BIN-1088",
      type: "critical",
      fill: 89,
      name: "Gwalior Junction South",
      place: "Gwalior Junction",
      coordinates: [26.2154, 78.1775],
      overflow: "~55 min",
      depth: "11 cm",
      vehicle: "TRK-04 • ETA 8 min",
    },
    {
      id: "BIN-1019",
      type: "filling",
      fill: 74,
      name: "City Centre Market",
      place: "City Centre",
      coordinates: [26.2132, 78.1935],
      overflow: "Due this shift",
      depth: "9 cm",
      vehicle: "TRK-08 • ETA 14 min",
    },
    {
      id: "BIN-1104",
      type: "filling",
      fill: 68,
      name: "Phool Bagh Collection Point",
      place: "Phool Bagh",
      coordinates: [26.2025, 78.1718],
      overflow: "Due this shift",
      depth: "8 cm",
      vehicle: "TRK-01 • ETA 18 min",
    },
    {
      id: "BIN-1120",
      type: "normal",
      fill: 42,
      name: "Morar Road North",
      place: "Morar",
      coordinates: [26.2264, 78.2315],
      overflow: "No overflow risk",
      depth: "5 cm",
      vehicle: "TRK-12 • ETA 25 min",
    },
    {
      id: "BIN-1155",
      type: "normal",
      fill: 35,
      name: "Fort Road East",
      place: "Gwalior Fort",
      coordinates: [26.2296, 78.1692],
      overflow: "No overflow risk",
      depth: "4 cm",
      vehicle: "TRK-04 • ETA 21 min",
    },
  ];

  const truckAssets = [
    { id: "TRK-01", type: "trucks", name: "TRK-01 • 28 km/h", coordinates: [26.205, 78.164] },
    { id: "TRK-04", type: "trucks", name: "TRK-04 • 34 km/h", coordinates: [26.218, 78.181] },
    { id: "TRK-08", type: "trucks", name: "TRK-08 • 19 km/h", coordinates: [26.214, 78.198] },
    { id: "TRK-12", type: "trucks", name: "TRK-12 • 22 km/h", coordinates: [26.225, 78.224] },
  ];

  const syncRouteLayer = () => {
    if (!mapInstance || !routeLayer) return;
    if (showRoutes && !mapInstance.hasLayer(routeLayer)) routeLayer.addTo(mapInstance);
    if (!showRoutes && mapInstance.hasLayer(routeLayer)) mapInstance.removeLayer(routeLayer);
    const routesButton = document.getElementById("toggle-ai-routes");
    if (routesButton) {
      const label = routesButton.querySelector("span:last-child");
      if (label) label.textContent = showRoutes ? "AI Routes: ON" : "AI Routes: OFF";
    }
    const settingsRoutes = document.getElementById("settings-routes");
    if (settingsRoutes) settingsRoutes.checked = showRoutes;
  };

  const loadMap = (L) => {
    if (!mapStage) throw new Error("The map viewport is missing from map.html.");

    const mapHost = document.createElement("div");
    mapHost.id = "real-gwalior-map";
    mapHost.className = "real-gwalior-map";
    mapHost.setAttribute("aria-label", "OpenStreetMap centered on Gwalior, Madhya Pradesh");
    mapStage.insertBefore(mapHost, mapStage.firstElementChild);
    mapStage.style.background = "#e7edf0";

    ["[data-location]", "#map-vector-layer", "#map-markers-layer"].forEach((selector) => {
      document.querySelectorAll(selector).forEach((layer) => {
        layer.style.display = "none";
      });
    });
    const labelLayer = document.getElementById("map-vector-layer").nextElementSibling;
    if (labelLayer) labelLayer.style.display = "none";

    mapInstance = L.map(mapHost, { center, zoom: 13, zoomControl: false, scrollWheelZoom: true });
    tileLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
    });
    tileLayer.on("load", () =>
      setMapStatus(
        focusAsset
          ? `Demo position preview: ${focusAsset} • real GPS not connected`
          : "OpenStreetMap tiles loaded • fleet data simulated",
      ),
    );
    tileLayer.on("tileerror", () => setMapStatus("Map tile unavailable • check your internet connection"));
    tileLayer.addTo(mapInstance);

    routeLayer = L.featureGroup([
      L.polyline(
        [
          [26.2023, 78.1573],
          [26.205, 78.164],
          [26.2154, 78.1775],
          [26.2132, 78.1935],
        ],
        { color: "#059669", weight: 5, opacity: 0.9, dashArray: "10 8" },
      ).bindTooltip("TRK-01 • simulated collection route"),
      L.polyline(
        [
          [26.2296, 78.1692],
          [26.218, 78.181],
          [26.2025, 78.1718],
        ],
        { color: "#0d9488", weight: 4, opacity: 0.85, dashArray: "8 8" },
      ).bindTooltip("TRK-04 • simulated collection route"),
    ]);

    const selectAsset = (asset) => {
      const inspectorDrawer = document.getElementById("inspector-drawer");
      if (inspectorDrawer) inspectorDrawer.hidden = asset.type === "trucks";
      if (asset.type === "trucks") return;

      const badgeClasses = {
        critical: "bg-error-container text-on-error-container",
        filling: "bg-secondary-container text-on-secondary-fixed-variant",
        normal: "bg-primary-fixed text-on-primary-fixed",
      };
      const valueClasses = {
        critical: "text-error",
        filling: "text-secondary",
        normal: "text-primary",
      };
      const badge = document.getElementById("asset-badge");
      const value = document.getElementById("asset-fill");
      const gauge = document.getElementById("asset-gauge");
      document.getElementById("asset-id").textContent = asset.id;
      document.getElementById("asset-title").textContent = asset.name;
      document.getElementById("asset-overflow").textContent = asset.overflow;
      document.getElementById("asset-depth").textContent = asset.depth;
      document.getElementById("asset-truck").textContent = asset.vehicle;
      document.getElementById("asset-fill").textContent = `${asset.fill}%`;
      badge.textContent = asset.type[0].toUpperCase() + asset.type.slice(1);
      badge.className = `px-space-sm py-0.5 rounded-full font-label-sm text-label-sm font-semibold ${badgeClasses[asset.type]}`;
      value.className = `font-metric-display text-metric-display ${valueClasses[asset.type]}`;
      gauge.className = `h-full rounded-full transition-all duration-500 ${valueClasses[asset.type].replace("text-", "bg-")}`;
      gauge.style.width = `${asset.fill}%`;
    };

    const markerIcon = (asset) => {
      const icon = asset.type === "trucks" ? "local_shipping" : "delete";
      return L.divIcon({
        className: "ecoroute-div-icon",
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        html: `<span class="ecoroute-marker marker-${asset.type}"><span class="material-symbols-outlined">${icon}</span></span>`,
      });
    };

    binAssets.concat(truckAssets).forEach((asset) => {
      const marker = L.marker(asset.coordinates, {
        icon: markerIcon(asset),
        title: `${asset.id} • ${asset.name}`,
        alt: `${asset.id}, ${asset.name}`,
      });
      if (asset.type === "trucks") {
        marker.bindPopup(`<strong>${asset.id}</strong><br>${asset.name}<br>Simulated vehicle position`);
        marker.on("click", () => selectAsset(asset));
      } else {
        marker.bindPopup(`<strong>${asset.id}</strong><br>${asset.name}<br>${asset.fill}% full`);
        marker.on("click", () => selectAsset(asset));
      }
      assetMarkers.push({ asset, marker });
    });

    applyAssetFilters = () => {
      const query = document.getElementById("map-asset-search").value.trim().toLowerCase();
      const enabled = document.getElementById("settings-assets")?.checked ?? showAssets;
      showAssets = enabled;
      const matchingAssets = [];
      assetMarkers.forEach(({ asset, marker }) => {
        const typeMatches = activeFilter === "all" || asset.type === activeFilter;
        const text = `${asset.id} ${asset.name} ${asset.place || ""}`.toLowerCase();
        const searchMatches = !query || text.includes(query);
        const visible = showAssets && typeMatches && searchMatches;
        if (visible) matchingAssets.push({ asset, marker });
        if (visible && !mapInstance.hasLayer(marker)) marker.addTo(mapInstance);
        if (!visible && mapInstance.hasLayer(marker)) mapInstance.removeLayer(marker);
      });
      if (query && matchingAssets.length === 1) {
        const match = matchingAssets[0];
        mapInstance.flyTo(match.asset.coordinates, 15);
        if (match.asset.type === "trucks") match.marker.openPopup();
        selectAsset(match.asset);
      }
    };

    const filterPills = [...document.querySelectorAll(".filter-pill")];
    const syncFilterPills = () => {
      filterPills.forEach((button) => {
        button.setAttribute("aria-pressed", String(button.dataset.filter === activeFilter));
      });
    };

    filterPills.forEach((button) => {
      button.addEventListener("click", () => {
        activeFilter = button.dataset.filter || "all";
        syncFilterPills();
        applyAssetFilters();
      });
    });
    syncFilterPills();
    document.getElementById("map-asset-search").addEventListener("input", applyAssetFilters);
    applyAssetFilters();
    if (focusAsset) {
      document.getElementById("inspector-drawer").hidden = true;
      const search = document.getElementById("map-asset-search");
      search.value = focusAsset;
      activeFilter = focusAsset.toUpperCase().startsWith("TRK-") ? "trucks" : "all";
      syncFilterPills();
      applyAssetFilters();
      setMapStatus(`Demo position preview: ${focusAsset} • real GPS not connected`);
    }

    routeLayer.addTo(mapInstance);
    const originalRoutesButton = document.getElementById("toggle-ai-routes");
    if (originalRoutesButton) {
      const routesButton = originalRoutesButton.cloneNode(true);
      originalRoutesButton.replaceWith(routesButton);
      routesButton.addEventListener("click", () => {
        showRoutes = !showRoutes;
        syncRouteLayer();
      });
    }
    syncRouteLayer();

    const zoomIn = document.querySelector('[title="Zoom In"]');
    const zoomOut = document.querySelector('[title="Zoom Out"]');
    const recenter = document.querySelector('[title="Recenter GPS"]');
    const layerToggle = document.querySelector('[title="Layer Selector"]');
    const fullscreen = document.querySelector('[title="Fullscreen"]');
    zoomIn?.addEventListener("click", () => mapInstance.zoomIn());
    zoomOut?.addEventListener("click", () => mapInstance.zoomOut());
    if (recenter) {
      recenter.title = "Center on Gwalior";
      recenter.setAttribute("aria-label", "Center map on Gwalior");
      recenter.addEventListener("click", () => mapInstance.flyTo(center, 13));
    }
    layerToggle?.addEventListener("click", () => {
      if (mapInstance.hasLayer(tileLayer)) mapInstance.removeLayer(tileLayer);
      else tileLayer.addTo(mapInstance);
      layerToggle.setAttribute("aria-pressed", String(!mapInstance.hasLayer(tileLayer)));
    });
    fullscreen?.addEventListener("click", async () => {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (mapStage.requestFullscreen) await mapStage.requestFullscreen();
      mapInstance.invalidateSize();
    });
    const viewRoute = [...document.querySelectorAll("button")].find((button) =>
      button.textContent.includes("View Route"),
    );
    viewRoute?.addEventListener("click", () => {
      showRoutes = true;
      syncRouteLayer();
      mapInstance.fitBounds(routeLayer.getBounds(), { padding: [40, 40], maxZoom: 15 });
    });
    const dispatchButton = document.getElementById("dispatch-btn");
    if (dispatchButton) {
      dispatchButton.innerHTML =
        '<span class="material-symbols-outlined text-[18px]">local_shipping</span><span>Assign Demo Truck</span>';
      dispatchButton.setAttribute("aria-label", "Assign a simulated collection truck");
      dispatchButton.addEventListener("click", () => {
        dispatchButton.innerHTML =
          '<span class="material-symbols-outlined text-[18px]">check_circle</span><span>Demo Truck Assigned</span>';
      });
    }
    if (!focusAsset) selectAsset(binAssets[0]);
    mapInstance.whenReady(() => window.setTimeout(() => mapInstance.invalidateSize(), 100));
  };

  loadLeaflet()
    .then(loadMap)
    .catch((error) => {
      console.error("Unable to initialize the Gwalior map.", error);
      setMapStatus("Map unavailable • check your internet connection and reload");
    });
})();
