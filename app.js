// Récupère les éléments du DOM
const form = document.getElementById("Formulaire");
const murIdees = document.getElementById("MurIdees");
let ideas = [];

let idEnEdition = null; // Variable pour suivre l'idée en cours d'édition


// Écouteur d'événement pour le formulaire
form.addEventListener("submit", function(event) {
  event.preventDefault(); // Empêche le rechargement de la page

  // Récupère les valeurs des champs du formulaire
  const titre = document.getElementById("Titre").value;
  const categorie = document.getElementById("Categorie").value;
  const description = document.getElementById("Description").value;


  // Validation : Vérifie que le titre et la description ne sont pas vides
  if (titre.trim() === "" || description.trim() === "") {
    alert(" Le titre et la description sont obligatoires !");
    return; // stoppe la fonction ici
  }

  if (idEnEdition !== null) {
    ideas = ideas.map((idee) => {
      if (idee.id === idEnEdition) {
        return { id: idEnEdition, titre, categorie, description }; // complète avec titre, categorie, description
      }
      return idee;  // les autres idées restent inchangées
    });

    idEnEdition = null;  // remet en mode création

  } else {
    // Crée une nouvelle idée avec un ID unique
    const nouvelleIdee = { id: Date.now(), titre, categorie, description };
    ideas.push(nouvelleIdee);

  }

  // Sauvegarde les idées dans le localStorage
  localStorage.setItem("ideas", JSON.stringify(ideas));
  murIdees.innerHTML = ""; // Vide le mur des idées avant de le recharger
  ideas.forEach((idee) => {
    afficherIdee(idee);
  });

  // Réinitialise les champs du formulaire
  document.getElementById("Titre").value = "";
  document.getElementById("Categorie").value = "Pédagogie";
  document.getElementById("Description").value = "";
  console.log(ideas); // Pour tester
});


// Fonction pour retourner la classe CSS de badge en fonction de la catégorie
function badgePourCategorie(categorie) {
    if (categorie === "Pédagogie")    return "badge-pedagogie";
    if (categorie === "Événement")    return "badge-evenement";
    if (categorie === "Vie de campus") return "badge-vie-de-campus";
    if (categorie === "Technologie")  return "badge-technologie";
    return "badge-autre";
}


// Fonction pour afficher une idée dans le mur des idées
function afficherIdee(idee) {
  const carte = document.createElement("div"); // crée une div
  carte.className = "col-12 col-sm-6 col-xl-4";
  carte.innerHTML = `
    <div class="idea-card">
        <span class="badge-categorie ${badgePourCategorie(idee.categorie)}">${idee.categorie}</span>
        <h3>${idee.titre}</h3>
        <p class="description">${idee.description}</p>
        <div class="card-actions">
        <button class="btn-editer" onclick="editerIdee(${idee.id})">Éditer</button>
        <button class="btn-supprimer" onclick="supprimerIdee(${idee.id})">Supprimer</button>
        </div>
    </div>
  `;
  murIdees.appendChild(carte); // ajoute la carte dans le mur
}


// Fonction pour charger les idées depuis le localStorage au démarrage
function chargerIdees() {
  const data = localStorage.getItem("ideas");
  
  if (data) {
    ideas = JSON.parse(data);
    ideas.forEach(function(idee) {
      afficherIdee(idee); // affiche chaque idée
    });
  }
}

chargerIdees(); // appelée au démarrage


// Fonction pour éditer une idée
function editerIdee(id) {
  const idee = ideas.find((i) => {
    return i.id === id;
  });
  document.getElementById("Titre").value = idee.titre;
  document.getElementById("Categorie").value = idee.categorie;
  document.getElementById("Description").value = idee.description;
  idEnEdition = id;
}

function supprimerIdee(id) {
  if (confirm("Êtes-vous sûr de vouloir supprimer cette idée ?")) {
    // Supprime l'idée du tableau et met à jour le localStorage
    ideas = ideas.filter((idee) => idee.id !== id);
    localStorage.setItem("ideas", JSON.stringify(ideas));

    // Recharge le mur des idées
    murIdees.innerHTML = "";
    ideas.forEach((idee) => {
      afficherIdee(idee);
    });
  }
}


// Écouteur d'événement pour le bouton de suggestion IA
document.getElementById("btnSuggerer").addEventListener("click", async function () {
  const titre = document.getElementById("Titre").value;

  // Validation : Vérifie que le titre n'est pas vide
  if (titre.trim() === "") {
    alert("Écris d'abord un titre !");
    return;
  }

  // Affiche le loader et désactive le bouton pour éviter les clics multiples
  document.getElementById("btnSuggerer").textContent = "⏳ L'IA génère une suggestion...";
  document.getElementById("btnSuggerer").disabled = true;

  // Appelle l'API Ollama pour générer une suggestion basée sur le titre
  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "mistral",
        stream: false,
        prompt: `Tu es un assistant pour une boîte à idées scolaire appelée Sunu-Idées.
  L'utilisateur a écrit ce titre : "${titre}"

  Réponds UNIQUEMENT en JSON valide, sans explication, sans markdown, sans backticks :
  {
    "categorie": "une seule valeur parmi : Pédagogie, Événement, Vie de campus, Technologie, Autre",
    "description": "une description courte de 2 phrases maximum en français"
  }`
        })
      });

      const data = await response.json();
      
      // Nettoie la réponse au cas où Mistral ajoute des backticks
      const clean = data.response.replace(/```json|```/g, "").trim();
      const suggestion = JSON.parse(clean);

      document.getElementById("Categorie").value = suggestion.categorie;
      document.getElementById("Description").value = suggestion.description;

    } catch (e) {
      alert("Ollama ne répond pas. Vérifie que 'ollama serve' est lancé dans ton terminal.");
    } finally {
      // Cache le loader dans tous les cas et réactive le bouton
      document.getElementById("btnSuggerer").textContent = "Suggérer avec l'IA";
      document.getElementById("btnSuggerer").disabled = false;
    } 
});


