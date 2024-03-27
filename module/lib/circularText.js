/**
 *
 * @param el
 * @param radius
 */
export function circularText(el, radius) {
  const txt = el.innerText.split('');
  const deg = 25;
  let origin = 0;
  el.classList.add;
  const newa = document.createElement('a.att-name-rounded');
  newa.style.fontWeight = 'bold';
  newa.style.position = 'relative';
  newa.style.top = '30px';
  newa.style.left = '-36px';
  newa.style.transformOrigin = '100% 150%';
  newa.style.transform = 'rotateZ(-110deg)';
  txt.forEach((ea) => {
    ea = `<p style='height:${radius}px;position:absolute;transform:rotate(${origin}deg);transform-origin:0 100%'>${ea}</p>`;
    newa.innerHTML += ea;
    if (ea == 'm' || 'M') {
      origin += 5;
    }
    origin += deg;
  });
  el.parentElement.prepend(newa);
}
