/* Musik hanya boleh mulai SETELAH klik Buka Undangan (#btn_open).
 * Menahan panggilan otomatis window.playAudio() (mis. saat tab dibuka kembali)
 * sebelum undangan dibuka. Klik Buka Undangan tetap memutar lagu seperti biasa.
 * Mendukung Safari di iOS/iPhone, iPad, dan mobile browser lainnya.
 */
(function () {
  var opened = false;

  function markOpened(e) {
    var t = e ? e.target : null;
    if (t && t.nodeType === 3) t = t.parentElement; // handle iOS Safari TextNode
    if (!t || (t.closest && t.closest("#btn_open")) || (t.id === "btn_open")) {
      opened = true;
      window.__amsAudioOpened = true;
    }
  }

  // Tangkap semua event interaksi (click, touchend, pointerup) dalam capture phase
  ["click", "touchend", "pointerup"].forEach(function (evt) {
    document.addEventListener(evt, markOpened, true);
  });

  // Listener langsung pada tombol jika elemen sudah ada
  function attachBtn() {
    var btn = document.getElementById("btn_open");
    if (btn) {
      ["click", "touchend", "pointerup"].forEach(function (evt) {
        btn.addEventListener(evt, function () {
          opened = true;
          window.__amsAudioOpened = true;
        }, true);
      });
    }
  }

  function isCoverClosed() {
    var cover = document.getElementById("cover");
    if (!cover) return true;
    if (cover.style.display === "none" || cover.classList.contains("close") || cover.classList.contains("opened")) {
      return true;
    }
    return false;
  }

  function guard() {
    attachBtn();
    if (window.playAudio && !window.playAudio.__amsGuarded) {
      var orig = window.playAudio;
      var wrapped = function () {
        // Jika cover sudah tertutup atau tombol sudah ditekan, izinkan pemutaran
        if (!opened && isCoverClosed()) {
          opened = true;
          window.__amsAudioOpened = true;
        }
        if (!opened && !window.__amsAudioOpened) return undefined;
        return orig.apply(this, arguments);
      };
      wrapped.__amsGuarded = true;
      window.playAudio = wrapped;
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", guard);
  else guard();
})();

