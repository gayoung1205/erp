// History Grid CustomNumberEditor
class CustomNumberEditor {
  constructor(props) {
    const el = document.createElement('input');
    el.className = 'form-control';
    el.style.cssText = 'height: calc(1.5em + 0.75rem + 2px)';
    el.type = 'number';
    el.value = props.value;
    this.el = el;
  }

  getElement() {
    return this.el;
  }

  getValue() {
    return parseInt(this.el.value);
  }

  mounted() {
    this.el.select();
  }
}

export default CustomNumberEditor;
