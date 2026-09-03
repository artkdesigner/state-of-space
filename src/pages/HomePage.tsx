import { useState } from 'react'
import NavBar from '../components/NavBar'
import HeroSection from '../components/HeroSection'
import IntroSection from '../components/IntroSection'
import Location1Section from '../components/Location1Section'
import BookingPopup from '../components/BookingPopup'

export default function HomePage() {
  const [bookingOpen, setBookingOpen] = useState(false)

  return (
    <>
      <NavBar onBookNow={() => setBookingOpen(true)} />
      <main>
        <HeroSection />
        <IntroSection />
        <Location1Section onBookNow={() => setBookingOpen(true)} />
      </main>
      <BookingPopup open={bookingOpen} onClose={() => setBookingOpen(false)} />
    </>
  )
}
