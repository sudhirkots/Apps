(function () {
  const data = window.SITE_DATA;
  const page = document.body.dataset.page || "home";

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  const link = (label, href, className) => {
    const node = el("a", className, label);
    node.href = href;
    if (href.startsWith("http")) {
      node.target = "_blank";
      node.rel = "noopener";
    }
    return node;
  };

  const normalize = (href) => href.replace(/\/$/, "") || "/";

  function renderHeader() {
    const header = el("header", "site-header");

    const top = el("div", "topbar");
    const topInner = el("div", "container topbar-inner");
    topInner.append(link(data.site.phone, "tel:" + data.site.phone.replace(/\s/g, ""), "contact-link"));
    topInner.append(link(data.site.email, "mailto:" + data.site.email, "contact-link"));
    top.append(topInner);

    const nav = el("nav", "container nav-wrap");
    const brand = link("", "/", "brand");
    const logo = el("img", "brand-logo");
    logo.src = "/assets/logo.png";
    logo.alt = data.site.name;
    const brandText = el("span", "brand-text");
    brandText.append(el("strong", "", data.site.doctor));
    brandText.append(el("small", "", data.site.tagline));
    brand.append(logo, brandText);

    const menuButton = el("button", "menu-button");
    menuButton.type = "button";
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-controls", "site-menu");
    menuButton.innerHTML = "<span></span><span></span><span></span>";

    const menu = el("div", "site-menu");
    menu.id = "site-menu";
    data.site.nav.forEach(([label, href]) => {
      const item = link(label, href, "");
      if (normalize(location.pathname) === normalize(href)) item.classList.add("active");
      menu.append(item);
    });
    menu.append(link("Appointment", data.site.appointmentUrl, "button button-small"));

    menuButton.addEventListener("click", () => {
      const open = menu.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(open));
    });

    nav.append(brand, menuButton, menu);
    header.append(top, nav);
    document.body.prepend(header);
  }

  function renderFooter() {
    const footer = el("footer", "site-footer");
    const inner = el("div", "container footer-grid");

    const intro = el("div", "");
    const logo = el("img", "footer-logo");
    logo.src = "/assets/logo.png";
    logo.alt = data.site.name;
    intro.append(logo, el("p", "", "Focused neurological and neurotology care for Pune and beyond."));

    const links = el("div", "");
    links.append(el("h2", "", "Links"));
    data.site.nav.forEach(([label, href]) => links.append(link(label, href, "footer-link")));

    const contact = el("div", "");
    contact.append(el("h2", "", "Clinic"));
    contact.append(el("p", "", data.site.address));
    contact.append(link(data.site.phone, "tel:" + data.site.phone.replace(/\s/g, ""), "footer-link"));
    contact.append(link(data.site.email, "mailto:" + data.site.email, "footer-link"));

    inner.append(intro, links, contact);
    footer.append(inner);
    const base = el("div", "footer-base", "All rights reserved. " + data.site.doctor);
    footer.append(base);
    document.body.append(footer);
  }

  function sectionShell(kicker, title, text) {
    const section = el("section", "section");
    const inner = el("div", "container");
    const heading = el("div", "section-heading");
    if (kicker) heading.append(el("p", "kicker", kicker));
    heading.append(el("h1", "", title));
    if (text) heading.append(el("p", "", text));
    inner.append(heading);
    section.append(inner);
    return { section, inner };
  }

  function renderHero(hero) {
    const section = el("section", "hero");
    section.style.backgroundImage = "linear-gradient(90deg, rgba(3, 34, 47, 0.88), rgba(3, 34, 47, 0.42)), url('" + hero.image + "')";
    const inner = el("div", "container hero-inner");
    inner.append(el("p", "kicker", hero.eyebrow));
    inner.append(el("h1", "", hero.title));
    inner.append(el("p", "hero-text", hero.text));
    const actions = el("div", "actions");
    actions.append(link(hero.primaryCta[0], hero.primaryCta[1], "button"));
    actions.append(link(hero.secondaryCta[0], hero.secondaryCta[1], "button button-ghost"));
    inner.append(actions);
    section.append(inner);
    document.querySelector("main").append(section);
  }

  function treatmentCard(item) {
    const card = el("article", "card treatment-card");
    card.id = item.slug;
    card.append(el("h2", "", item.title));
    card.append(el("p", "summary", item.summary));
    card.append(el("p", "", item.details));
    return card;
  }

  function renderHome() {
    const main = document.querySelector("main");
    renderHero(data.home.hero);

    const actions = el("section", "section section-tight");
    const actionGrid = el("div", "container action-grid");
    data.home.quickActions.forEach((item) => {
      const card = el("a", "action-card");
      card.href = item.link;
      card.append(el("h2", "", item.title), el("p", "", item.text));
      actionGrid.append(card);
    });
    actions.append(actionGrid);
    main.append(actions);

    const treatments = sectionShell("Treatments and Procedures", "Care for neurological and balance conditions", data.home.treatmentsIntro);
    const grid = el("div", "grid grid-3");
    data.treatments.slice(0, 6).forEach((item) => {
      const card = el("article", "card compact-card");
      card.append(el("h2", "", item.title));
      card.append(el("p", "", item.summary));
      card.append(link("Learn More", "/treatments/#" + item.slug, "text-link"));
      grid.append(card);
    });
    treatments.inner.append(grid);
    main.append(treatments.section);

    const profile = el("section", "section split-section");
    const profileInner = el("div", "container split-grid");
    const copy = el("div", "");
    copy.append(el("p", "kicker", "Specialist Profile"));
    copy.append(el("h1", "", data.home.doctorIntro.title));
    copy.append(el("p", "", data.home.doctorIntro.text));
    copy.append(link("Know More", data.home.doctorIntro.link, "button"));
    const image = el("img", "split-image");
    image.src = data.doctor.image;
    image.alt = data.doctor.name;
    profileInner.append(copy, image);
    profile.append(profileInner);
    main.append(profile);

    const clinic = el("section", "section split-section alt-band");
    const clinicInner = el("div", "container split-grid reverse");
    const clinicImage = el("img", "split-image");
    clinicImage.src = data.home.clinicIntro.image;
    clinicImage.alt = data.home.clinicIntro.title;
    const clinicCopy = el("div", "");
    clinicCopy.append(el("p", "kicker", "Clinic"));
    clinicCopy.append(el("h1", "", data.home.clinicIntro.title));
    clinicCopy.append(el("p", "", data.home.clinicIntro.text));
    clinicCopy.append(link("Know More", data.home.clinicIntro.link, "button"));
    clinicInner.append(clinicImage, clinicCopy);
    clinic.append(clinicInner);
    main.append(clinic);

    renderHoursAndEnquiry(main);
  }

  function renderAbout() {
    const main = document.querySelector("main");
    const shell = sectionShell("About", data.about.title, data.about.subtitle);
    const rows = el("div", "content-stack");
    data.about.sections.forEach((item) => {
      const row = el("article", "wide-panel");
      row.append(el("h2", "", item.title), el("p", "", item.text));
      rows.append(row);
    });
    const featureGrid = el("div", "grid grid-4");
    data.about.features.forEach(([title, text]) => {
      const card = el("article", "card compact-card");
      card.append(el("h2", "", title), el("p", "", text));
      featureGrid.append(card);
    });
    shell.inner.append(rows, featureGrid);
    main.append(shell.section);
  }

  function renderDoctors() {
    const main = document.querySelector("main");
    const shell = sectionShell("Doctors", "Our Doctors", "Meet our experienced and compassionate specialist.");
    const card = el("article", "doctor-card");
    const image = el("img", "");
    image.src = data.doctor.image;
    image.alt = data.doctor.name;
    const copy = el("div", "");
    copy.append(el("h2", "", data.doctor.name));
    copy.append(el("p", "summary", data.doctor.role));
    copy.append(el("p", "", data.doctor.qualification));
    copy.append(link("Know More", "/doctors/dr-sudhir-kothari/", "button"));
    card.append(image, copy);
    shell.inner.append(card);
    main.append(shell.section);
  }

  function renderDoctorProfile() {
    const main = document.querySelector("main");
    const shell = sectionShell("Doctor Profile", data.doctor.name, data.doctor.role);
    const intro = el("div", "profile-layout");
    const image = el("img", "profile-image");
    image.src = data.doctor.image;
    image.alt = data.doctor.name;
    const facts = el("div", "wide-panel");
    facts.append(el("h2", "", data.doctor.qualification));
    data.doctor.contact.forEach((item) => facts.append(el("p", "", item)));
    facts.append(link("Book Appointment", data.site.appointmentUrl, "button"));
    intro.append(image, facts);

    const education = el("div", "timeline");
    education.append(el("h2", "", "Education"));
    data.doctor.education.forEach(([year, degree, detail]) => {
      const item = el("article", "timeline-item");
      item.append(el("span", "", year), el("h3", "", degree), el("p", "", detail));
      education.append(item);
    });

    const sections = el("div", "content-stack");
    data.doctor.sections.forEach((section) => {
      const panel = el("article", "wide-panel");
      panel.append(el("h2", "", section.title));
      const list = el("ul", "clean-list");
      section.items.forEach((item) => list.append(el("li", "", item)));
      panel.append(list);
      sections.append(panel);
    });

    shell.inner.append(intro, education, sections);
    main.append(shell.section);
  }

  function renderTreatments() {
    const main = document.querySelector("main");
    const shell = sectionShell("Treatments", "Treatments and Procedures", "We diagnose and support a variety of neurological, vestibular and balance-related concerns.");
    const grid = el("div", "grid grid-2");
    data.treatments.forEach((item) => grid.append(treatmentCard(item)));
    shell.inner.append(grid);
    main.append(shell.section);
  }

  function renderBlogs() {
    const main = document.querySelector("main");
    const shell = sectionShell("Blogs", "Latest Blog Posts", "Clinic notes and patient education articles.");
    const list = el("div", "content-stack");
    data.blogs.forEach((post) => {
      const article = el("article", "wide-panel");
      article.id = post.slug;
      article.append(el("p", "kicker", post.date + " / " + post.author));
      article.append(el("h2", "", post.title));
      article.append(el("p", "summary", post.summary));
      article.append(el("p", "", post.body));
      list.append(article);
    });
    shell.inner.append(list);
    main.append(shell.section);
  }

  function renderEnquiry() {
    const main = document.querySelector("main");
    const shell = sectionShell("Contact", data.enquiry.title, data.enquiry.intro);
    const layout = el("div", "enquiry-layout");
    const form = el("form", "enquiry-form");
    form.innerHTML =
      '<label>Name<input name="name" required></label>' +
      '<label>Email address<input type="email" name="email" required></label>' +
      '<label>Phone<input name="phone"></label>' +
      '<label>Enquiry For<select name="topic"></select></label>' +
      '<label>Message<textarea name="message" rows="5"></textarea></label>' +
      '<button class="button" type="submit">Send Enquiry</button>';
    const select = form.querySelector("select");
    data.enquiry.options.forEach((option) => {
      const node = el("option", "", option);
      node.value = option;
      select.append(node);
    });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const values = new FormData(form);
      const subject = encodeURIComponent("Website enquiry: " + values.get("topic"));
      const body = encodeURIComponent(
        "Name: " + values.get("name") + "\n" +
        "Email: " + values.get("email") + "\n" +
        "Phone: " + values.get("phone") + "\n" +
        "Enquiry for: " + values.get("topic") + "\n\n" +
        values.get("message")
      );
      location.href = "mailto:" + data.site.email + "?subject=" + subject + "&body=" + body;
    });

    const contact = el("aside", "wide-panel contact-panel");
    contact.append(el("h2", "", "Clinic Details"));
    contact.append(el("p", "", data.site.address));
    contact.append(link(data.site.phone, "tel:" + data.site.phone.replace(/\s/g, ""), "footer-link"));
    contact.append(link(data.site.alternatePhone, "tel:" + data.site.alternatePhone.replace(/\s/g, ""), "footer-link"));
    contact.append(link(data.site.email, "mailto:" + data.site.email, "footer-link"));
    contact.append(link("Open Map", data.site.mapsUrl, "button button-soft"));
    layout.append(form, contact);
    shell.inner.append(layout);
    main.append(shell.section);
  }

  function renderHoursAndEnquiry(main) {
    const section = el("section", "section alt-band");
    const inner = el("div", "container hours-grid");
    const hours = el("div", "wide-panel");
    hours.append(el("h1", "", "Opening Hours"));
    data.site.hours.forEach(([day, time]) => {
      const row = el("div", "hours-row");
      row.append(el("span", "", day), el("strong", "", time));
      hours.append(row);
    });
    const enquiry = el("div", "wide-panel");
    enquiry.append(el("h1", "", "Send Enquiry"));
    enquiry.append(el("p", "", "Have a question about appointments, testing or consultation? Send the clinic a note."));
    enquiry.append(link("Start Enquiry", "/enquiry/", "button"));
    inner.append(hours, enquiry);
    section.append(inner);
    main.append(section);
  }

  const renderers = {
    home: renderHome,
    about: renderAbout,
    doctors: renderDoctors,
    doctor: renderDoctorProfile,
    treatments: renderTreatments,
    blogs: renderBlogs,
    enquiry: renderEnquiry
  };

  renderHeader();
  renderers[page]();
  renderFooter();
})();
