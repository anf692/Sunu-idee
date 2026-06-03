const SUPABASE_URL = "https://gydmfdpximufssjitxkb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5ZG1mZHB4aW11ZnNzaml0eGtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0OTc3MzEsImV4cCI6MjA5NjA3MzczMX0.v_gQemOjn4EP4KPOnL7gheGd41fxqsVdelHnIiDIgCQ"; 

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

  if (idEnEdition !== null) {
    const { error } = await supabaseClient
    .from("idees")
    .update({ titre, categorie, description })
    .eq("id", idEnEdition);

    idEnEdition = null;
    await chargerIdees();

  } else {
    
    const { data, error } = await supabaseClient
    .from("idees")
    .insert([{ titre, categorie, description }]);

    await chargerIdees();

  }

  // Réinitialise les champs du formulaire
  form.reset();
  
  console.log("Idée soumise avec succès !");
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


// Fonction pour charger les idées depuis Supabase et les afficher
async function chargerIdees() {
  const { data, error } = await supabaseClient
    .from("idees")  
    .select("*");

  if (error) {
    console.error("Erreur chargement :", error);
    return;
  }

  murIdees.innerHTML = "";
  data.forEach((idee) => afficherIdee(idee));
}

chargerIdees(); // appelée au démarrage


// Fonction pour éditer une idée
async function editerIdee(id) {
  const { data, error } = await supabaseClient
    .from("idees")
    .select("*")
    .eq("id", id)
    .single();

  if (error) { console.error("Erreur édition :", error); return; }

  document.getElementById("Titre").value = data.titre;
  document.getElementById("Categorie").value = data.categorie;
  document.getElementById("Description").value = data.description;
  idEnEdition = id;
}

// Fonction pour supprimer une idée
async function supprimerIdee(id) {
  const { error } = await supabaseClient
    .from("idees")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erreur suppression :", error);
    return;
  }

  await chargerIdees(); // recharge le mur
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
    const response = await fetch("/api/ai", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemma-4-31b-it:freeze-2024-06-01",
        messages: [{
           role: "user",
        content: `Tu es un assistant pour une boîte à idées scolaire appelée Sunu-Idées.
  L'utilisateur a écrit ce titre : "${titre}"

  Réponds UNIQUEMENT en JSON valide, sans explication, sans markdown, sans backticks :
  {
    "categorie": "une seule valeur parmi : Pédagogie, Événement, Vie de campus, Technologie, Autre",
    "description": "une description courte de 2 phrases maximum en français"
  }`
        }],

        // Active le mode de raisonnement pour que Mistral explique sa suggestion avant de donner la réponse finale
        "reasoning": {"enabled": true}
        
    }),
    });

      const data = await response.json();

      console.log(data);

      //
      const raw = data.choices[0].message.content;
      
      // Nettoie la réponse au cas où Mistral ajoute des backticks
      const clean = raw.replace(/```json|```/g, "").trim();
      const suggestion = JSON.parse(clean);

      document.getElementById("Categorie").value = suggestion.categorie;
      document.getElementById("Description").value = suggestion.description;

    } catch (e) {
      document.getElementById("Categorie").value = "Amélioration technique";
      document.getElementById("Description").value = "Description à compléter.";
      console.warn("Fallback activé :", e);
    } finally {
      // Cache le loader dans tous les cas et réactive le bouton
      document.getElementById("btnSuggerer").textContent = "Suggérer avec l'IA";
      document.getElementById("btnSuggerer").disabled = false;
    } 
});


