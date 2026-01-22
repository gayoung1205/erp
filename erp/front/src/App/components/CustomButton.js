// History Grid CustomButton
class CustomButton {
  constructor(props) {
    const el = document.createElement('button');
    el.textContent = 'X';
    el.style.background = '#f4f7fa';
    el.style.color = 'red';
    el.style.border = '0';
    this.el = el;
    this.render(props);
  }

  getElement() {
    return this.el;
  }

  render(props) {
    this.el.value = String(props.value);
  }
}
export default CustomButton;
