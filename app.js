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


 
const btnIA = document.getElementById("btnIA");

btnIA.addEventListener("click", async () => {

  const titre = document.getElementById("Titre").value;

  if (!titre.trim()) {
    alert("Saisissez un titre");
    return;
  }

  try{

    btnIA.disabled = true;
    btnIA.textContent = "Génération...";

    const response = await fetch(
    "http://localhost:11434/api/generate",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3:latest",
        prompt: `
      Tu es un assistant pour une boîte à idées.

    Titre : ${titre}

    Choisis une catégorie parmi :
    - Pédagogie
    - Événement
    - Vie de campus
    - Technologie
    - Autre

    Puis rédige une description :

    - claire
    - professionnelle
    - entre 20 et 40 mots
    - expliquant l'objectif de l'idée
    - sans liste à puces

    Réponds sur 2 lignes seulement :

    Categorie
    Description
  `,
          stream: false
        })
      }
    );

    

    const data = await response.json();

    const lignes = data.response.trim().split("\n");

    document.getElementById("Categorie").value =
      lignes[0].trim();

    document.getElementById("Description").value =
      lignes.slice(1).join(" ").trim();

    } catch (error) {

    console.error(error);

    alert(
      "Erreur lors de la communication avec Ollama"
    );

    } finally {

      btnIA.disabled = false;
      btnIA.textContent =
        "🤖 Générer avec IA";
    }

  

});