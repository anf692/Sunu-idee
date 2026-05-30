// Récupère les éléments du DOM
const form = document.getElementById("Formulaire");
const murIdees = document.getElementById("MurIdees");
let ideas = [];


// Écouteur d'événement pour le formulaire
form.addEventListener("submit", function(event) {
  event.preventDefault(); // Empêche le rechargement de la page

  // Récupère les valeurs des champs du formulaire
  const titre = document.getElementById("Titre").value;
  const categorie = document.getElementById("Categorie").value;
  const description = document.getElementById("Description").value;

  const nouvelleIdee = { id: Date.now(), titre, categorie, description };

  // Ajoute la nouvelle idée à la liste et met à jour le localStorage
  ideas.push(nouvelleIdee);
  localStorage.setItem("ideas", JSON.stringify(ideas));
  afficherIdee(nouvelleIdee);

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
        <button class="btn-editer">Éditer</button>
        <button class="btn-supprimer">Supprimer</button>
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

chargerIdees(); // appelée au démarrageconst form = document.getElementById("Formulaire");


