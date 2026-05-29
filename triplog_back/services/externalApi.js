

//////////////////////// NOMINATIM - Recherche de villes ////////////////////////

/**
 * Recherche les villes correspondant à une requête donnée en utilisant l'API Nominatim d'OpenStreetMap.
 * 
 * @param {string} query - Le terme de recherche pour trouver des villes.
 * @return {Promise<Array>} - Un tableau d'objets représentant les villes trouvées, avec des informations telles que le nom, le pays, les coordonnées, etc.
 */
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

// Convertit un code météo Open-Meteo en une description texte du temps

/*
Weather variable documentation
WMO Weather interpretation codes (WW)
Code	Description
0	Clear sky
1, 2, 3	Mainly clear, partly cloudy, and overcast
45, 48	Fog and depositing rime fog
51, 53, 55	Drizzle: Light, moderate, and dense intensity
56, 57	Freezing Drizzle: Light and dense intensity
61, 63, 65	Rain: Slight, moderate and heavy intensity
66, 67	Freezing Rain: Light and heavy intensity
71, 73, 75	Snow fall: Slight, moderate, and heavy intensity
77	Snow grains
80, 81, 82	Rain showers: Slight, moderate, and violent
85, 86	Snow showers slight and heavy
95 *	Thunderstorm: Slight or moderate
96, 99 *	Thunderstorm with slight and heavy hail
*/

/**
 * Convertit un code météo Open-Meteo en une description texte du temps.
 * 
 * @param {number} code - Le code météo à convertir.
 * @return {string} - La description texte correspondant au code météo.
 */
function getDescriptionMeteo(code) {
    switch (code) {
        case 0:
            return 'Ciel dégagé';
        case 1:
            return 'Principalement dégagé';
        case 2:
            return 'Partiellement nuageux';
        case 3:
            return 'Couvert';
        case 45:
            return 'Brouillard';
        case 48:
            return 'Brouillard givrant';
        case 51:
            return 'Bruine légère';
        case 53:
            return 'Bruine modérée';
        case 55:
            return 'Bruine forte';
        case 56:
            return 'Bruine verglaçante légère';
        case 57:
            return 'Bruine verglaçante forte';
        case 61:
            return 'Pluie légère';
        case 63:
            return 'Pluie modérée';
        case 65:
            return 'Pluie forte';
        case 66:
            return 'Pluie verglaçante légère';
        case 67:
            return 'Pluie verglaçante forte';
        case 71:
            return 'Chute de neige légère';
        case 73:
            return 'Chute de neige modérée';
        case 75:
            return 'Chute de neige forte';
        case 77:
            return 'Grains de neige';
        case 80:
            return 'Averses de pluie légères';
        case 81:
            return 'Averses de pluie modérées';
        case 82:
            return 'Averses de pluie violentes';
        case 85:
            return 'Averses de neige légères';
        case 86:
            return 'Averses de neige fortes';
        case 95:
            return 'Orage léger ou modéré';
        case 96:
            return 'Orage avec grêle légère';
        case 99:
            return 'Orage avec grêle forte';
        default:
            return 'Inconnu';
    }
}

/**
 * Récupère les informations météorologiques pour une ville donnée en utilisant l'API Open-Meteo.
 * 
 * @param {number} lat - La latitude de la ville.
 * @param {number} lon - La longitude de la ville.
 * @return {Promise<Array>} - Un tableau d'objets représentant les prévisions météorologiques pour les 7 prochains jours, avec des informations telles que la date, la température maximale et minimale, le code météo, et une description du temps.
 */
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
            codeMeteo: data.daily.weathercode[i],

            /* Récupérer la description textuelle du code météo */
            descriptionMeteo: getDescriptionMeteo(data.daily.weathercode[i])
        })
    }

    return jours
}



/////////////////////////// RESTCOUNTRIES - Récupération d'infos sur un pays ////////////////////////

/**
 * Récupère les informations sur un pays donné en utilisant l'API REST Countries.
 * 
 * @param {string} codePays - Le code du pays à récupérer.
 * @return {Promise<Object>} - Un objet représentant les informations sur le pays.
 */
async function getInfosPays(codePays) {

    // Construire l'URL de la requête REST Countries
    const url = `https://restcountries.com/v3.1/alpha/${encodeURIComponent(codePays)}`
              + `?fields=name,flags,currencies,languages,capital,population`

    const reponse = await fetch(url)
    const data = await reponse.json()

    if (!data || data.status === 404) {
        return null
    }

    // Retourner les informations sur le pays
    return {
        nom: data.name?.common ?? '',
        drapeau: data.flags?.emoji ?? '',
        capitale: data.capital?.[0] ?? '',
        monnaie: Object.values(data.currencies ?? {})[0]?.name ?? '',
        symbole: Object.values(data.currencies ?? {})[0]?.symbol ?? '',
        langues: Object.values(data.languages ?? {})[0] ?? '',
        population: data.population ?? 0
    }
}

module.exports = { searchCities, getMeteo, getDescriptionMeteo, getInfosPays }