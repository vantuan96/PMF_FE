import React from 'react'
class PL01 extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      data: ''
    };
  }
  componentDidMount() {
    this.getData()
  }
  getData() { }
  render() {
    const { data } = this.state;
    console.log(data)
    return (
      <></>
    )
  }
}
export default PL01