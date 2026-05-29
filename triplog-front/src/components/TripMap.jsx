import { useEffect, useRef } from 'react';

/**
 * Affiche les étapes sur une carte.
 * @param {Array} steps - La liste des étapes du voyage.
 * @returns {JSX.Element} - Le composant de la carte.
 */
export default function TripMap({ steps }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // Filtre uniquement les étapes avec coordonnées, dans l'ordre
  const stepsWithCoords = steps.filter((s) => s.latitude && s.longitude);

  useEffect(() => {
    if (stepsWithCoords.length === 0) return;
    if (!window.L) return; // Leaflet pas encore chargé

    const L = window.L;

    // Détruit la carte précédente si elle existe
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Crée la carte
    const map = L.map(mapRef.current, { zoomControl: true });
    mapInstanceRef.current = map;

    // Tuiles OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    const latlngs = [];

    // Ajoute les marqueurs pour chaque étape avec coordonnées
    stepsWithCoords.forEach((step, i) => {
      const lat = parseFloat(step.latitude);
      const lng = parseFloat(step.longitude);
      latlngs.push([lat, lng]);

      // Icône avec le numéro de l'étape
      const numberedIcon = L.divIcon({
        className: '',
        html: `<div style="
          width: 32px; height: 32px;
          background: #C9932A;
          border: 2px solid #EDE8DF;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: Cabin, sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: #1C1A17;
        ">${i + 1}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -20],
      });

      // Ajoute le marqueur à la carte avec une popup contenant le nom de la ville et la date d'arrivée
      const marker = L.marker([lat, lng], { icon: numberedIcon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: Cabin, sans-serif; min-width: 120px;">
          <strong style="color: #C9932A;">Étape ${i + 1}</strong><br/>
          <span style="font-size: 0.9rem;">${step.city}</span>
          ${step.arrivalDate ? `<br/><span style="font-size: 0.8rem; color: #666;">📅 ${step.arrivalDate.slice(0, 10)}</span>` : ''}
        </div>
      `);
    });

    // Tracé de la route entre les étapes
    if (latlngs.length > 1) {
      L.polyline(latlngs, {
        color: '#C9932A',
        weight: 2,
        opacity: 0.7,
        dashArray: '6, 8',
      }).addTo(map);
    }

    // Centre la carte sur toutes les étapes
    const bounds = L.latLngBounds(latlngs);
    map.fitBounds(bounds, { padding: [40, 40] });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [steps]);

  if (stepsWithCoords.length === 0) return null;

  return (
    <div className="card card-map">
      <div className="card-map-header">
        <h2 className="card-map-title">
          Carte du voyage
          <span className="card-map-count muted">
            {stepsWithCoords.length} étape{stepsWithCoords.length > 1 ? 's' : ''}
          </span>
        </h2>
      </div>
      <div ref={mapRef} className="card-map-container" />
    </div>
  );
}