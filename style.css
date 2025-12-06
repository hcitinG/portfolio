 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/style.css b/style.css
new file mode 100644
index 0000000000000000000000000000000000000000..483c6dc756121fe6df0f5d21874cc5c82270c3e4
--- /dev/null
+++ b/style.css
@@ -0,0 +1,419 @@
+:root {
+  --bg: #fdfbf8;
+  --text: #222222;
+  --muted: #5f5f5f;
+  --accent: #b24c4c;
+  --card: #ffffff;
+  --border: #e5e1da;
+  --shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
+}
+
+* {
+  box-sizing: border-box;
+}
+
+body {
+  margin: 0;
+  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
+  background: var(--bg);
+  color: var(--text);
+  line-height: 1.6;
+  scroll-behavior: smooth;
+}
+
+a {
+  color: inherit;
+  text-decoration: none;
+}
+
+img {
+  width: 100%;
+  display: block;
+  border-radius: 14px;
+}
+
+.container {
+  width: min(1080px, 94vw);
+  margin: 0 auto;
+}
+
+.section {
+  padding: 96px 0;
+}
+
+.section-header {
+  text-align: center;
+  max-width: 700px;
+  margin: 0 auto 48px;
+}
+
+h1, h2, h3 {
+  color: var(--text);
+  margin: 0 0 16px;
+  line-height: 1.3;
+}
+
+p {
+  margin: 0 0 14px;
+  color: var(--muted);
+}
+
+.eyebrow {
+  letter-spacing: 0.2em;
+  text-transform: uppercase;
+  font-weight: 600;
+  font-size: 12px;
+  color: var(--accent);
+  margin-bottom: 12px;
+}
+
+.section-lead {
+  font-size: 18px;
+}
+
+.btn {
+  display: inline-flex;
+  align-items: center;
+  gap: 8px;
+  padding: 12px 18px;
+  border-radius: 999px;
+  font-weight: 600;
+  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, color 0.2s ease;
+  cursor: pointer;
+  border: 1px solid transparent;
+}
+
+.btn.primary {
+  background: var(--accent);
+  color: #fff;
+  box-shadow: 0 10px 30px rgba(178, 76, 76, 0.25);
+}
+
+.btn.primary:hover {
+  transform: translateY(-2px);
+  box-shadow: 0 12px 36px rgba(178, 76, 76, 0.3);
+}
+
+.btn.ghost {
+  background: transparent;
+  border-color: var(--border);
+  color: var(--text);
+}
+
+.btn.ghost:hover {
+  border-color: var(--accent);
+  color: var(--accent);
+  transform: translateY(-2px);
+}
+
+.btn.link {
+  padding: 0;
+  color: var(--accent);
+  font-weight: 600;
+  border: none;
+  background: none;
+}
+
+.btn.link:hover {
+  color: #8f3535;
+  transform: translateY(-1px);
+}
+
+.site-header {
+  position: sticky;
+  top: 0;
+  z-index: 1000;
+  background: rgba(253, 251, 248, 0.98);
+  backdrop-filter: blur(8px);
+  border-bottom: 1px solid var(--border);
+}
+
+.header-content {
+  display: flex;
+  align-items: center;
+  justify-content: space-between;
+  padding: 18px 0;
+}
+
+.logo {
+  font-weight: 700;
+  font-size: 18px;
+  letter-spacing: 0.02em;
+}
+
+.nav {
+  display: flex;
+  gap: 18px;
+  align-items: center;
+}
+
+.nav a {
+  padding: 8px 12px;
+  border-radius: 999px;
+  transition: background 0.2s ease, color 0.2s ease;
+  font-weight: 500;
+}
+
+.nav a:hover {
+  background: #f0ebe2;
+  color: var(--accent);
+}
+
+.menu-toggle {
+  display: none;
+  flex-direction: column;
+  gap: 5px;
+  background: none;
+  border: none;
+  padding: 8px;
+  cursor: pointer;
+}
+
+.menu-toggle span {
+  width: 24px;
+  height: 2px;
+  background: var(--text);
+  display: block;
+  border-radius: 999px;
+  transition: transform 0.2s ease;
+}
+
+.hero {
+  padding: 120px 0 100px;
+}
+
+.hero-grid {
+  display: grid;
+  grid-template-columns: repeat(12, 1fr);
+  gap: 32px;
+  align-items: center;
+}
+
+.hero-text {
+  grid-column: span 7;
+}
+
+.hero-visual {
+  grid-column: span 5;
+}
+
+.subtitle {
+  font-size: 18px;
+}
+
+.hero-actions {
+  display: flex;
+  gap: 12px;
+  margin-top: 24px;
+}
+
+.projects-grid {
+  display: grid;
+  grid-template-columns: repeat(3, 1fr);
+  gap: 24px;
+}
+
+.card {
+  background: var(--card);
+  border: 1px solid var(--border);
+  border-radius: 16px;
+  overflow: hidden;
+  box-shadow: var(--shadow);
+  transition: transform 0.2s ease, box-shadow 0.2s ease;
+}
+
+.card:hover {
+  transform: translateY(-6px);
+  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.08);
+}
+
+.card-body {
+  padding: 20px;
+}
+
+.card-meta {
+  font-size: 13px;
+  text-transform: uppercase;
+  letter-spacing: 0.08em;
+  color: var(--accent);
+  margin-bottom: 8px;
+}
+
+.two-column {
+  display: grid;
+  grid-template-columns: 1.2fr 1fr;
+  gap: 32px;
+  align-items: start;
+}
+
+.skills-grid {
+  display: grid;
+  grid-template-columns: repeat(2, 1fr);
+  gap: 18px;
+}
+
+.skill-block {
+  background: #fff;
+  border: 1px solid var(--border);
+  border-radius: 14px;
+  padding: 18px;
+  box-shadow: var(--shadow);
+  transition: transform 0.2s ease, box-shadow 0.2s ease;
+}
+
+.skill-block:hover {
+  transform: translateY(-4px);
+  box-shadow: 0 14px 32px rgba(0, 0, 0, 0.08);
+}
+
+.chips {
+  display: flex;
+  flex-wrap: wrap;
+  gap: 10px;
+}
+
+.chips span {
+  background: #f0ebe2;
+  color: var(--text);
+  padding: 8px 12px;
+  border-radius: 999px;
+  font-weight: 600;
+  font-size: 14px;
+}
+
+.timeline {
+  display: grid;
+  gap: 16px;
+}
+
+.experience h3 {
+  margin-bottom: 10px;
+}
+
+.contact-grid {
+  align-items: center;
+}
+
+.contact-details {
+  display: flex;
+  flex-direction: column;
+  gap: 14px;
+}
+
+.contact-email {
+  font-size: 20px;
+  font-weight: 700;
+  color: var(--accent);
+}
+
+.social-links {
+  display: flex;
+  gap: 14px;
+}
+
+.social-links a {
+  padding: 10px 14px;
+  border: 1px solid var(--border);
+  border-radius: 10px;
+  transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
+}
+
+.social-links a:hover {
+  background: var(--accent);
+  color: #fff;
+  transform: translateY(-2px);
+}
+
+.back-to-top {
+  position: fixed;
+  bottom: 24px;
+  right: 24px;
+  width: 48px;
+  height: 48px;
+  border-radius: 50%;
+  border: none;
+  background: var(--accent);
+  color: #fff;
+  font-size: 22px;
+  box-shadow: 0 10px 20px rgba(178, 76, 76, 0.35);
+  cursor: pointer;
+  display: none;
+  align-items: center;
+  justify-content: center;
+  transition: transform 0.2s ease, box-shadow 0.2s ease;
+  z-index: 1500;
+}
+
+.back-to-top:hover {
+  transform: translateY(-2px);
+  box-shadow: 0 14px 28px rgba(178, 76, 76, 0.42);
+}
+
+/* Responsive */
+@media (max-width: 960px) {
+  .hero-grid {
+    grid-template-columns: 1fr;
+  }
+
+  .hero-text, .hero-visual {
+    grid-column: span 12;
+  }
+
+  .hero-visual {
+    order: -1;
+  }
+
+  .projects-grid {
+    grid-template-columns: repeat(2, 1fr);
+  }
+
+  .two-column {
+    grid-template-columns: 1fr 1fr;
+  }
+}
+
+@media (max-width: 720px) {
+  .header-content {
+    padding: 14px 0;
+  }
+
+  .nav {
+    position: absolute;
+    top: 64px;
+    right: 16px;
+    background: #fff;
+    border: 1px solid var(--border);
+    border-radius: 12px;
+    box-shadow: var(--shadow);
+    padding: 12px 0;
+    flex-direction: column;
+    align-items: flex-start;
+    width: 220px;
+    display: none;
+  }
+
+  .nav a {
+    width: 100%;
+    padding: 10px 16px;
+  }
+
+  .nav.open {
+    display: flex;
+  }
+
+  .menu-toggle {
+    display: flex;
+  }
+
+  .projects-grid {
+    grid-template-columns: 1fr;
+  }
+
+  .skills-grid {
+    grid-template-columns: 1fr;
+  }
+
+  .two-column {
+    grid-template-columns: 1fr;
+  }
+}
 
EOF
)
