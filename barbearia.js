// destaca o dia de hoje na tabela de horários
(function () {
  var li = document.querySelector('.hrs li[data-dia="' + new Date().getDay() + '"]');
  if (li) li.classList.add('hoje');
})();
