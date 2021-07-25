import React, { Component } from "react";

class Modal extends Component {
  constructor(props) {
    super(props)
  }

  closeModal = () => {
    this.props.closeModal()
  }

  render() {
    return (
      <div id="modalDim" onClick={this.closeModal}></div>
    )
  }
}

export default Modal;
