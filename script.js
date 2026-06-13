(function () {
  const content = window.siteContent || {};
  const tokenPattern = /^\{\{.+\}\}$/;
  const tokenKeyMap = {
    ORG_NAME: "organizationName",
    PRIMARY_CTA_URL: "primaryCtaUrl",
    CONTACT_EMAIL: "contactEmail",
    TRUST_SUMMARY: "trustSummary",
  };

  function isToken(value) {
    return typeof value === "string" && tokenPattern.test(value.trim());
  }

  function keyToToken(key) {
    return (
      "{{" +
      String(key)
        .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
        .toUpperCase() +
      "}}"
    );
  }

  function readValue(key, fallback) {
    const value = content[key];
    if (value === undefined || value === null || value === "") {
      return fallback;
    }
    return value;
  }

  function resolveInlineTokens(value) {
    if (typeof value !== "string") {
      return value;
    }

    return value.replace(/\{\{([A-Z0-9_]+)\}\}/g, function (match, tokenName) {
      const key = tokenKeyMap[tokenName];
      if (!key) {
        return match;
      }

      const replacement = readValue(key, match);
      return replacement === undefined || replacement === null || replacement === ""
        ? match
        : replacement;
    });
  }

  function setText(element, value, fallback) {
    if (!element) {
      return;
    }

    const rawText = value === undefined || value === null || value === "" ? fallback : value;
    const text = resolveInlineTokens(rawText);
    element.textContent = text;
    element.classList.toggle("is-token", isToken(text));
  }

  function setHref(element, href) {
    if (!element) {
      return;
    }

    if (!href || isToken(href)) {
      element.setAttribute("href", "#contact");
      element.classList.add("is-disabled");
      return;
    }

    element.setAttribute("href", href);
    element.classList.remove("is-disabled");
  }

  function hydrateFields() {
    document.querySelectorAll("[data-field]").forEach(function (node) {
      const key = node.getAttribute("data-field");
      setText(node, readValue(key, keyToToken(key)), keyToToken(key));
    });

    document.querySelectorAll("[data-link]").forEach(function (node) {
      const key = node.getAttribute("data-link");
      if (key === "contactEmailLink") {
        const email = resolveInlineTokens(readValue("contactEmail", keyToToken("contactEmail")));
        if (!isToken(email)) {
          setHref(node, "mailto:" + email);
        } else {
          setHref(node, "#contact");
        }
        return;
      }

      setHref(node, resolveInlineTokens(readValue(key, keyToToken(key))));
    });

    document.title =
      resolveInlineTokens(readValue("organizationName", keyToToken("organizationName"))) +
      " | ISO/IEC 42001:2023 소개";

    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        "content",
        resolveInlineTokens(
          readValue(
          "heroSummary",
          "{{ORG_NAME}}의 ISO/IEC 42001:2023 소개와 AI 거버넌스 신뢰 메시지를 전달하는 홈페이지"
          )
        )
      );
    }
  }

  function createCard(className, innerHtml) {
    const article = document.createElement("article");
    article.className = className + " reveal";
    article.innerHTML = innerHtml;
    return article;
  }

  function renderSnapshot() {
    const root = document.getElementById("snapshot-grid");
    if (!root) {
      return;
    }

    (content.snapshotItems || []).forEach(function (item) {
      const card = createCard(
        "snapshot-card",
        '<p class="card-kicker">' +
          resolveInlineTokens(item.label) +
          "</p>" +
          '<p class="snapshot-value">' +
          resolveInlineTokens(item.value) +
          "</p>"
      );
      if (isToken(resolveInlineTokens(item.value))) {
        card.querySelector(".snapshot-value").classList.add("is-token");
      }
      root.appendChild(card);
    });
  }

  function renderValues() {
    const root = document.getElementById("value-grid");
    if (!root) {
      return;
    }

    (content.valueItems || []).forEach(function (item) {
      root.appendChild(
        createCard(
          "value-card",
          '<p class="card-kicker">고객 관점</p>' +
            '<h3 class="grid-title">' +
            resolveInlineTokens(item.title) +
            "</h3>" +
            '<p class="grid-copy">' +
            resolveInlineTokens(item.body) +
            "</p>"
        )
      );
    });
  }

  function renderPillars() {
    const root = document.getElementById("pillar-grid");
    if (!root) {
      return;
    }

    (content.pillarItems || []).forEach(function (item) {
      root.appendChild(
        createCard(
          "pillar-card",
          '<p class="card-kicker">운영 원칙</p>' +
            '<h3 class="grid-title">' +
            resolveInlineTokens(item.title) +
            "</h3>" +
            '<p class="grid-copy">' +
            resolveInlineTokens(item.body) +
            "</p>"
        )
      );
    });
  }

  function renderPractice() {
    const root = document.getElementById("practice-list");
    if (!root) {
      return;
    }

    (content.practiceItems || []).forEach(function (item) {
      root.appendChild(
        createCard(
          "practice-item",
          '<p class="practice-index">' +
            resolveInlineTokens(item.label) +
            "</p>" +
            '<div class="practice-body">' +
            '<h3 class="grid-title">' +
            resolveInlineTokens(item.title) +
            "</h3>" +
            '<p class="grid-copy">' +
            resolveInlineTokens(item.body) +
            "</p>" +
            "</div>"
        )
      );
    });
  }

  function renderAudience() {
    const root = document.getElementById("audience-grid");
    if (!root) {
      return;
    }

    (content.audienceItems || []).forEach(function (item) {
      root.appendChild(
        createCard(
          "audience-card",
          '<h3 class="grid-title">' +
            resolveInlineTokens(item.title) +
            "</h3>" +
            '<p class="grid-copy">' +
            resolveInlineTokens(item.body) +
            "</p>"
        )
      );
    });
  }

  function renderFaq() {
    const root = document.getElementById("faq-list");
    if (!root) {
      return;
    }

    (content.faqItems || []).forEach(function (item, index) {
      const faq = document.createElement("details");
      faq.className = "faq-item reveal";
      if (index === 0) {
        faq.open = true;
      }
      faq.innerHTML =
        '<summary class="faq-question">' +
        resolveInlineTokens(item.q) +
        '<span class="faq-icon" aria-hidden="true"></span>' +
        "</summary>" +
        '<p class="faq-answer">' +
        resolveInlineTokens(item.a) +
        "</p>";
      root.appendChild(faq);
    });
  }

  function installObserver() {
    const nodes = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      nodes.forEach(function (node) {
        node.classList.add("is-visible");
      });
      return;
    }

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.16,
        rootMargin: "0px 0px -48px 0px",
      }
    );

    nodes.forEach(function (node) {
      observer.observe(node);
    });
  }

  function installNav() {
    const header = document.querySelector(".site-header");
    const toggle = document.querySelector(".nav-toggle");
    const menu = document.getElementById("nav-menu");

    function syncHeader() {
      if (header) {
        header.classList.toggle("is-scrolled", window.scrollY > 8);
      }
    }

    syncHeader();
    window.addEventListener("scroll", syncHeader, { passive: true });

    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener("click", function () {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      menu.classList.toggle("is-open");
    });

    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        toggle.setAttribute("aria-expanded", "false");
        menu.classList.remove("is-open");
      });
    });
  }

  function installStructuredData() {
    const orgName = resolveInlineTokens(
      readValue("organizationName", keyToToken("organizationName"))
    );
    const email = resolveInlineTokens(readValue("contactEmail", keyToToken("contactEmail")));
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: orgName + " ISO/IEC 42001:2023 소개",
      description: resolveInlineTokens(readValue("heroSummary", "")),
      about: {
        "@type": "Organization",
        name: orgName,
        email: isToken(email) ? undefined : email,
      },
    });
    document.head.appendChild(script);
  }

  function installYear() {
    const year = document.getElementById("year");
    if (year) {
      year.textContent = String(new Date().getFullYear());
    }
  }

  hydrateFields();
  renderSnapshot();
  renderValues();
  renderPillars();
  renderPractice();
  renderAudience();
  renderFaq();
  installObserver();
  installNav();
  installStructuredData();
  installYear();
})();
