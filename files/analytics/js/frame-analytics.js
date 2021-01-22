setTimeout(() => {
  var nonce = window.parent.document.getElementsByTagName("script")[0].nonce;
  console.log(nonce);
  var x = window.parent.document.createElement("script");
  x.setAttribute("nonce", nonce);
  x.innerHTML="alert(origin)";
  window.parent.document.body.appendChild(x);
}, 5000);
