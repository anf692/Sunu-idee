const SUPABASE_URL = "https://jcoyeikgwwrdxpfatxyw.supabase.co"; // identifiant
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impjb3llaWtnd3dyZHhwZmF0eHl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0OTY4MTAsImV4cCI6MjA5NjA3MjgxMH0.XAFZ37FF-vgbqGkn-r0lgDcFKjZgBl_yggacse_yBFA"

const supabaseClient = supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY);


// Récupère les éléments du DOM
const form = document.getElementById("Formulaire");
const murIdees = document.getElementById("MurIdees");

let idEnEdition = null; // Variable pour suivre l'idée en cours d'édition


// Écouteur d'événement pour le formulaire
form.addEventListener("submit", async function(event) {
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

  if(!["Pédagogie","Événement","Vie de campus","Technologie","Autre"].includes(categorie)){
    alert('veuiller respecter le nom du champ categorie');
    return;
  }

  if (idEnEdition !== null) {
    const {error} =await supabaseClient
    .from('sunu-idee')
    .update({titre,categorie,description})
    .eq('id',idEnEdition)

    if (error){
      console.error('mise a jour',  error);
      return;
    }

    idEnEdition = null; 
    await chargerIdees();
    
  } 
  else {

    const {data, error} = await supabaseClient
    .from("sunu-idee")
    .insert([{
      titre,categorie,description
    }]);  

    if (error){
      console.error("erreur lors de l'ajout", error);
    }

    await chargerIdees();
  }

  // Réinitialise les champs du formulaire
  form.reset()

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


// Fonction pour charger les idées depuis le SUPABASE au démarrage
async function chargerIdees() {
  const { data, error } = await supabaseClient
  .from('sunu-idee')
  .select('*')

  if(error){
    console.error("erreur chargement", error);
    return
  }

  murIdees.innerHTML ="";

  data.forEach(function(idee){
    afficherIdee(idee)
  });

}

chargerIdees(); // appelée au démarrage


// Fonction pour éditer une idée
async function editerIdee(id) {
  const {data, error} = await supabaseClient
  .from('sunu-idee')
  .select('*')
  .eq('id',id)
  .single()

  if(error){
    console.error('erreur edition', error);
    return;
  }

  document.getElementById("Titre").value = data.titre;
  document.getElementById("Categorie").value = data.categorie;
  document.getElementById("Description").value = data.description;

  idEnEdition = id;

}

async function supprimerIdee(id) {
  const confimation = confirm('etes vous sûre de vouloir supprimer cette idée');

  if(!confimation) return;


 const {error} = await supabaseClient
 .from('sunu-idee')
 .delete()
 .eq('id',id)

 if(error){
  console.error('erreur de suppression', error);
  return;
 }

 await chargerIdees();
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

    const response = await fetch("/api/ai",{
      
      method: "POST",
      headers: {"Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemma-4-31b-it:freeze-2024-06-01",
        messages: [{
        role: "user",
        content:`

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
  `
      }
    ],

     "reasoning": {"enabled": true}
      
        })
      }
    );

    console.log("Status :", response.status);

if (!response.ok) {
  const errorText = await response.text();
  console.error(errorText);
  throw new Error(errorText);
}

    const data = await response.json();
    console.log(data)

    const lignes = data.choices[0].message.content.trim().split("\n");

    document.getElementById("Categorie").value =
      lignes[0].trim();

    document.getElementById("Description").value =
      lignes.slice(1).join(" ").trim();

      //apres generation ça permet de desactiver le champ categorie met si l'ia se trompe impossible de modifier le champ categorie
    // document.getElementById("Categorie").disabled = true;  
    } catch (error) {

    console.error(error.message);

    alert(
      "Erreur lors de la communication avec Ollama"
    );

    } finally {

      btnIA.disabled = false;
      btnIA.textContent =
        "🤖 Générer avec IA";
    }

  

});

