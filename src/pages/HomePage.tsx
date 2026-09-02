import NavBar from '../components/NavBar'
import HeroSection from '../components/HeroSection'
import IntroSection from '../components/IntroSection'

export default function HomePage() {
  return (
    <>
      <NavBar />
      <main>
        <HeroSection />
        <IntroSection />
      </main>
    </>
  )
}
