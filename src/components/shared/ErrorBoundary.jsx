import { Component } from 'react'
import { Button } from '../ui/Button.jsx'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 p-8">
          <p className="text-lg font-semibold text-primary">Đã xảy ra lỗi</p>
          <Button variant="secondary" onClick={() => window.location.reload()}>
            Tải lại trang
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
