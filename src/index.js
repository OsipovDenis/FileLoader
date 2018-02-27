import React, {Component} from 'react'
import {render} from 'react-dom'

class FileLoader extends Component {
  state = {
    fileInfo: {
      lastModifiedDate: null,
      name: null,
      size: null,
      type: null
    },
    percentLoaded: null,
    error: null
  }

  fr = null

  fileToBinaryString = file => {
    return new Promise((resolve, reject) => {
      this.fr = new FileReader
      this.fr.onload = () => {
        resolve(this.fr.result)
      }
      this.fr.onloadend = () => {
        this.fr = null
      }
      this.fr.onerror = progressEvent => {
        this.errorHandler(progressEvent)
        reject()
      }
      this.fr.onprogress = this.udpateProgress
      this.fr.readAsBinaryString(file)
    })
  }

  // from here https://www.html5rocks.com/en/tutorials/file/dndfiles/
  errorHandler = progressEvent => {
    switch(progressEvent.target.error.code) {
      case progressEvent.target.error.NOT_FOUND_ERR:
        alert('File Not Found!')
        break
      case progressEvent.target.error.NOT_READABLE_ERR:
        alert('File is not readable')
        break
      case progressEvent.target.error.ABORT_ERR:
        break
      default:
        alert('An error occurred reading this file.')
    }
  }

  udpateProgress = progressEvent => {
    if (progressEvent.lengthComputable) {
      const percentLoaded = Math.round((progressEvent.loaded / progressEvent.total) * 100);
      if (percentLoaded < 100)
        this.setState({percentLoaded})
      else
        this.setState({percentLoaded: 100})
    }
  }

  onChangeFile = async ({target: {files}}) => {
    const file = files[0]
    this.setState({fileInfo: {
      lastModifiedDate: file.lastModifiedDate,
      name: file.name,
      size: file.size,
      type: file.type
    }})
    let fileBase64
    try {
      fileBase64 = await this.fileToBinaryString(file)
    } catch (e) {
      this.setState({error: e.message})
      throw e
    }
    // fileBase64 ready to transfer
  }

  onAbort = () => {
    if (this.fr) {
      this.fr.abort()
      alert('File Aborted')
    }
  }

  render() {
    const {percentLoaded, error, fileInfo: {lastModifiedDate, name, size, type}} = this.state
    return (
      <div>
        <input onChange={this.onChangeFile} type="file" />
        <button onClick={this.onAbort}>Abort</button>
        {name && <p>name: {name}</p>}
        {size && <p>size: {size}</p>}
        {type && <p>type: {type}</p>}
        {lastModifiedDate && <p>lastModifiedDate: {lastModifiedDate.toLocaleString()}</p>}
        {percentLoaded && <div>Процент загрузки {percentLoaded}%</div>}
        {error && <div style={{color: 'red'}}>{error}</div>}
      </div>
    )
  }
}

render(<FileLoader />, document.querySelector('.app'))
