//add a ready function
let whenDocumentReady = (f) => {
  /in/.test(document.readyState)
    ? setTimeout("whenDocumentReady(" + f + ")", 9)
    : f();
};

whenDocumentReady(
  (isReady = () => {
    //show it
    document.getElementById("showBody").classList.remove("d-none");
  })
);
