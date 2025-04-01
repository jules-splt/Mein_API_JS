let allVehicles = [];
      let uniqueCountries = new Set();
      let uniqueTiers = new Set();
      let currentFilters = { country: "all", era: "all" };

      async function fetchAllVehicles() {
         let page = 0;
         let vehicles = [];
         let hasMorePages = true;

         try {
            while (hasMorePages) {
               const url = new URL("https://www.wtvehiclesapi.sgambe.serv00.net/api/vehicles");
               url.searchParams.append("limit", 200);
               url.searchParams.append("page", page);

               // Ajout des filtres dynamiques
               if (currentFilters.country !== "all") url.searchParams.append("country", currentFilters.country);
               if (currentFilters.era !== "all") url.searchParams.append("era", currentFilters.era);

               ["isPremium", "isPack", "isSquadronVehicle", "isOnMarketplace", "excludeKillstreak", "excludeEventVehicles"]
               .forEach(param => {
                  if (currentFilters[param] !== undefined) {
                     url.searchParams.append(param, currentFilters[param]);
                  }
               });

               const response = await fetch(url);
               const data = await response.json();
               
               if (data.length === 0) {
                  hasMorePages = false;
               } else {
                  vehicles = vehicles.concat(data);
                  page++;
               }
            }

            allVehicles = vehicles;
            extractCountries();
            extractTiers();
            displayVehicles(allVehicles);
         } catch (error) {
            console.error("Erreur lors de la récupération des véhicules :", error);
         }
      }

      function extractCountries() {
         uniqueCountries.clear();
         allVehicles.forEach(vehicle => uniqueCountries.add(vehicle.country));
         const menu = document.getElementById("countryMenu");
         menu.innerHTML = `<div onclick="setFilter('country','all')">Tous les pays</div>`;
         uniqueCountries.forEach(country => {
            menu.innerHTML += `<div onclick="setFilter('country','${country}')">
                                 <img src="https://wiki.warthunder.com/static/country_svg/country_${country.toLowerCase()}.svg" style="width:20px;"> 
                                 ${country.toUpperCase()}
                              </div>`;
         });
      }

      function extractTiers() {
         uniqueTiers.clear();
         allVehicles.forEach(vehicle => uniqueTiers.add(vehicle.era));
         const menu = document.getElementById("TiersMenu");
         menu.innerHTML = `<div onclick="setFilter('era', 'all')">Tous les Tiers</div>`;
         uniqueTiers.forEach(era => {
            menu.innerHTML += `<div onclick="setFilter('era', ${era})">Tier ${era}</div>`;
         });
      }

      function displayVehicles(vehicles) {
         const container = document.getElementById("vehicles");
         container.innerHTML = "";

         vehicles.forEach(vehicle => {
            const card = document.createElement("div");
            card.className = "vehicle-card";
            card.innerHTML = `
               <img src="${vehicle.images.image}" alt="${vehicle.identifier}">
               <h3>${vehicle.identifier.replace(/_/g, " ").toUpperCase()}</h3>
               <p><strong>Pays :</strong> ${vehicle.country.toUpperCase()}</p>
               <p><strong>Type :</strong> ${vehicle.vehicle_type.replace("_", " ")}</p>
               <p><strong>BR :</strong> ${vehicle.realistic_br}</p>
            `;
            container.appendChild(card);
         });
      }

      function applyFilters() {
         ["isPremium", "isPack", "isSquadronVehicle", "isOnMarketplace", "excludeKillstreak", "excludeEventVehicles"]
         .forEach(param => {
            currentFilters[param] = document.getElementById(param).checked;
         });

         fetchAllVehicles();
      }

      function setFilter(type, value) {
         currentFilters[type] = value;
         fetchAllVehicles();
         toggleMenu(type === "country" ? "countryMenu" : "TiersMenu");
      }

      function toggleMenu(id) {
         document.getElementById(id).classList.toggle("active");
      }

      fetchAllVehicles();