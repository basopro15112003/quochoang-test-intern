import './App.css'
import { Hearder } from './components/header'
import { ProductList } from './components/product-list'

function App() {

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Hearder></Hearder>
        <ProductList />
      </div>
    </>
  )
}

export default App
