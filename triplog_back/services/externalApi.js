

//////////////////////// NOMINATIM - Recherche de villes ////////////////////////
async function searchCities(query) {

    // Construire l'URL de la requête Nominatim
    const url = `https://nominatim.openstreetmap.org/search`
            + `?q=${encodeURIComponent(query)}`
            + `&format=json`
            + `&limit=5`
            + `&addressdetails=1`
    
    // Envoie une requête HTTP GET à Nominatim avec un header personnalisé
    const reponse = await fetch(url, {
    headers: { 'User-Agent': 'TripLog/1.0' }
    });
    

    const data = await reponse.json();

    // Si aucune donnée n'est retournée, retourner un tableau vide
    if (!data || data.length === 0) {
        return []
    }
        
    // Retourner les informations pertinentes
    return data.map(lieu => {

        let nomVille = ''

        if (lieu.address.city) {
            nomVille = lieu.address.city
        }
        else if (lieu.address.town) {
            nomVille = lieu.address.town
        }
        else if (lieu.address.village) {
            nomVille = lieu.address.village
        }
        else {
            nomVille = lieu.name
        }

        return {
            nom: nomVille,
            nomComplet: lieu.display_name,
            pays : lieu.address?.country ?? '',
            codePays: lieu.address?.country_code?.toUpperCase() ?? '',
            latitude: parseFloat(lieu.lat),
            longitude: parseFloat(lieu.lon)
        }
    })
}


//////////////////////// OPENWEATHER - Récupération de la météo d'une ville ////////////////////////
async function getMeteo(lat, lon) {

    // Construire l'URL de la requête Open-Meteo
    const url = `https://api.open-meteo.com/v1/forecast`
            + `?latitude=${lat}`
            + `&longitude=${lon}`
            + `&daily=temperature_2m_max,temperature_2m_min,weathercode`
            + `&forecast_days=7`
            + `&timezone=auto`

    const response = await fetch(url);
    const data = await response.json();

    if (!data || !data.daily) {
        return null
    }

    const jours = []

    for (let i = 0; i < 7; i++) {
        jours.push({
            date: data.daily.time[i],
            temperatureMax: data.daily.temperature_2m_max[i],
            temperatureMin: data.daily.temperature_2m_min[i],
            meteo: data.daily.weathercode[i]
        })
    }

    return jours
}

// Convertit un code météo Open-Meteo en une description texte du temps
function getDescriptionMeteo(code) {
  if (code === 0) return 'Ensoleillé'
  if (code <= 2) return 'Peu nuageux'
  if (code === 3) return 'Couvert'
  if (code <= 49) return 'Brouillard'
  if (code <= 59) return 'Bruine'
  if (code <= 69) return 'Pluie'
  if (code <= 79) return 'Neige'
  if (code <= 82) return 'Averses'
  if (code <= 99) return 'Orage'
  return 'Inconnu'
}


/////////////////////////// RESTCOUNTRIES - Récupération d'infos sur un pays ////////////////////////

async function getInfosPays(nomPays) {
    const url = `https://restcountries.com/v3.1/name/${encodeURIComponent(nomPays)}`
            + `?fields=name,flags,currencies,languages,capital,population`

    const reponse = await fetch(url)
    const data = await reponse.json()

    if (!data || data.length === 0) {
        return null
    }

    const pays = data[0]

    return {
        nom: pays.name?.common ?? '',
        drapeau: pays.flags?.emoji ?? '',
        capitale: pays.capital?.[0] ?? '',
        monnaie: Object.values(pays.currencies ?? {})[0]?.name ?? '',
        symbole: Object.values(pays.currencies ?? {})[0]?.symbol ?? '',
        langues: Object.values(pays.languages ?? {})[0] ?? '',
        population: pays.population ?? 0
    }
}

module.exports = { searchCities, getMeteo, getDescriptionMeteo, getInfosPays }