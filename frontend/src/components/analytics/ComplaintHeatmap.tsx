'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin } from 'lucide-react'

export interface HeatmapPoint {
  lat: number
  lng: number
  intensity?: number
  label?: string
}

interface ComplaintHeatmapProps {
  points: HeatmapPoint[]
  title?: string
}

const DEFAULT_LAT = 33.6844
const DEFAULT_LNG = 73.0479
const DEFAULT_ZOOM = 11

const DEMO_POINTS: HeatmapPoint[] = [
  { lat: 33.7215, lng: 73.0433, intensity: 8, label: 'F-7 Markaz' },
  { lat: 33.6938, lng: 73.0651, intensity: 5, label: 'G-9' },
  { lat: 33.7294, lng: 73.0931, intensity: 3, label: 'E-7' },
  { lat: 33.6600, lng: 73.0100, intensity: 6, label: 'I-8' },
  { lat: 33.7100, lng: 73.1200, intensity: 4, label: 'F-10' },
  { lat: 33.6750, lng: 73.0550, intensity: 7, label: 'G-11' },
  { lat: 33.7400, lng: 73.0700, intensity: 2, label: 'F-6' },
  { lat: 33.6500, lng: 73.0800, intensity: 5, label: 'H-8' },
]

export const ComplaintHeatmap = ({ points, title = 'Complaint Distribution' }: ComplaintHeatmapProps) => {
  const mapRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null)
  const [mounted, setMounted] = useState(false)

  const displayPoints = points.length > 0 ? points : DEMO_POINTS

  // Only render on client
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || mapInstanceRef.current) return

    // Inject Leaflet CSS dynamically — avoids invalid <link> in JSX
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
        scrollWheelZoom: false,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      mapInstanceRef.current = map

      displayPoints.forEach((pt) => {
        const intensity = pt.intensity ?? 1
        const radius = Math.max(300, intensity * 400)
        const opacity = Math.min(0.7, 0.2 + intensity * 0.06)
        const color = intensity >= 7 ? '#DC2626' : intensity >= 4 ? '#F59E0B' : '#16A34A'

        L.circle([pt.lat, pt.lng], {
          radius, color, fillColor: color, fillOpacity: opacity, weight: 1,
        })
          .addTo(map)
          .bindPopup(`<strong>${pt.label ?? 'Complaint cluster'}</strong><br/>${intensity} report${intensity !== 1 ? 's' : ''}`)
      })
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted])

  return (
    <div className="bg-white rounded-lg shadow-card border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-4 h-4 text-primary-700" aria-hidden="true" />
        <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
        {points.length === 0 && (
          <span className="text-xs text-gray-400 ml-auto">Demo data</span>
        )}
      </div>

      {mounted ? (
        <div
          ref={mapRef}
          className="w-full h-72 rounded-lg overflow-hidden z-0"
          aria-label="Complaint heatmap"
          role="img"
        />
      ) : (
        <div className="w-full h-72 rounded-lg bg-gray-100 animate-pulse" />
      )}

      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-success inline-block" aria-hidden="true" />Low (1–3)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" aria-hidden="true" />Medium (4–6)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-danger inline-block" aria-hidden="true" />High (7+)
        </span>
      </div>
    </div>
  )
}
