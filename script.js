 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/script.js b/script.js
new file mode 100644
index 0000000000000000000000000000000000000000..cdf54d2e76352ebd5afcfc76eddef3be36673f3d
--- /dev/null
+++ b/script.js
@@ -0,0 +1,34 @@
+const nav = document.getElementById('mainNav');
+const menuToggle = document.getElementById('menuToggle');
+const backToTop = document.getElementById('backToTop');
+
+menuToggle.addEventListener('click', () => {
+  nav.classList.toggle('open');
+});
+
+document.querySelectorAll('a[href^="#"]').forEach(link => {
+  link.addEventListener('click', event => {
+    const targetId = link.getAttribute('href');
+    if (targetId.startsWith('#') && targetId.length > 1) {
+      event.preventDefault();
+      const target = document.querySelector(targetId);
+      if (target) {
+        target.scrollIntoView({ behavior: 'smooth' });
+      }
+      nav.classList.remove('open');
+    }
+  });
+});
+
+window.addEventListener('scroll', () => {
+  if (window.scrollY > 300) {
+    backToTop.style.display = 'flex';
+  } else {
+    backToTop.style.display = 'none';
+  }
+});
+
+backToTop.addEventListener('click', () => {
+  document.getElementById('hero').scrollIntoView({ behavior: 'smooth' });
+  nav.classList.remove('open');
+});
 
EOF
)
