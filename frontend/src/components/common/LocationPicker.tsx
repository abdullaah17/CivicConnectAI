'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin } from 'lucide-react'

interface LocationPickerProps {
  value?: string
  onChange: (location: string) => void
  className?: string
}

const DEFAULT_LAT = 33.6844
const DEFAULT_LNG = 73.0479
const DEFAULT_ZOOM = 12

export const LocationPicker = ({ value, onChange, className }: LocationPickerProps) => {
  const mapRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null)
  const [picked, setPicked] = useState(false)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || mapInstanceRef.current) return

    // Inject Leaflet CSS dynamically
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      link.crossOrigin = ''
      document.head.appendChild(link)
    }

    import('leaflet').then((L) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      if (!mapRef.current) return

      const map = L.map(mapRef.current, {
        center: [DEFAULT_LAT, DEFAULT_LNG],
        zoom: DEFAULT_ZOOM,
        zoomControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      mapInstanceRef.current = map

      map.on('click', (e: { latlng: { lat: number; lng: number } }) => {
        const { lat, lng } = e.latlng

        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng])
        } else {
          markerRef.current = L.marker([lat, lng]).addTo(map)
        }

        setCoords({ lat, lng })
        setPicked(true)

        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
          .then((r) => r.json())
          .then((data) => {
            onChange(data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`)
          })
          .catch(() => {
            onChange(`${lat.toFixed(5)}, ${lng.toFixed(5)}`)
          })
      })
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        markerRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted])

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-2">
        <MapPin className="w-4 h-4 text-primary-700" aria-hidden="true" />
        <span className="text-sm font-medium text-gray-700">
          Pin Location on Map
          <span className="text-gray-400 font-normal ml-1">(optional — click to place pin)</span>
        </span>
      </div>

      {mounted ? (
        <div
          ref={mapRef}
          className="w-full h-56 rounded-lg border border-gray-200 overflow-hidden z-0"
          aria-label="Interactive map — click to pin your location"
          role="application"
        />
      ) : (
        <div className="w-full h-56 rounded-lg border border-gray-200 bg-gray-100 animate-pulse" />
      )}

      {picked && coords && (
        <p className="mt-1.5 text-xs text-success flex items-center gap-1" aria-live="polite">
          <MapPin className="w-3 h-3" aria-hidden="true" />
          Pin placed at {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
          {value && ` — ${value.slice(0, 60)}${value.length > 60 ? '…' : ''}`}
        </p>
      )}
    </div>
  )
}
