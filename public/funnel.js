// Compatibility guard for an older cached checklist page. No data is read or sent.
(function () {
  var form = document.getElementById("optin");
  if (!form) return;
  form.addEventListener("submit", function (event) { event.preventDefault(); });
  var notice = document.createElement("p");
  notice.textContent = "Email signup is paused. ";
  var download = document.createElement("a");
  download.href = "/downloads/enquiry-leak-checklist.pdf";
  download.textContent = "Download the checklist without signing up (PDF).";
  notice.appendChild(download);
  form.replaceWith(notice);
})();
