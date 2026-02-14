import CenterContent from "./components/CenterContent/CenterContent"
import Footer from "./components/footer/Footer"
import Header from "./components/header/header"
import LeftSidebar from "./components/LeftSidebar/LeftSidebar"
import RightSidebar from "./components/RightSidebar/RightSidebar"

function App() {

  return (
    <div className="bg-neutral-bg font-linkedin min-h-screen">
      <Header />

      <main className="max-w-content mx-auto pt-16 px-6 grid grid-cols-[225px_1fr_300px] gap-6 max-content:flex max-content:flex-col">
        <LeftSidebar />
        <CenterContent />
        <RightSidebar />
      </main>

      <Footer />
    </div>
  )
}

export default App
