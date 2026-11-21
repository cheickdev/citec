// Contenu de la vitrine citec.app (faits verifies uniquement).
export const CONTACT = {
  whatsapp: "22376842672",
  whatsappLabel: "+223 76 84 26 72",
  city: "Bamako, Mali",
};

export interface Product {
  slug: string;
  name: string;
  url: string;
  urlLabel: string;
  color: string;
  ico: string;
  tagline: string;
  forWho: string;
  points: string[];
  cta: string;
}

export const PRODUCTS: Product[] = [
  {
    slug: "simple-pos",
    name: "Simple Pos",
    url: "https://pos.2mt.shop",
    urlLabel: "pos.2mt.shop",
    color: "#39ff14",
    ico: "🧾",
    tagline: "La caisse et la gestion de boutique, sur le téléphone.",
    forWho: "Boutiques, alimentations, vendeuses en ligne, magasins.",
    points: [
      "Encaissement rapide avec scan des codes-barres par la caméra",
      "Stock, alertes de rupture, réceptions et inventaires",
      "Ventes à crédit : chaque dette notée, relevé de compte par WhatsApp",
      "Rapports : chiffre d'affaires, bénéfice, meilleures ventes",
      "Fonctionne même sans internet",
      "Employés avec code PIN et droits choisis par le patron",
    ],
    cta: "Essayer gratuitement 15 jours",
  },
  {
    slug: "2mt-shopping",
    name: "2MT Shopping",
    url: "https://www.2mt.shop",
    urlLabel: "www.2mt.shop",
    color: "#ff3d7f",
    ico: "🛍️",
    tagline: "La boutique en ligne et la place de marché de Bamako.",
    forWho: "Clients qui achètent en ligne, vendeurs qui veulent vendre plus.",
    points: [
      "Commande en ligne, paiement à la livraison",
      "Livraison dans les quartiers de Bamako",
      "Espace vendeur : chaque vendeur publie ses produits",
      "Lien avec Simple Pos : le stock du vendeur se met à jour tout seul",
    ],
    cta: "Visiter la boutique",
  },
  {
    slug: "freephone",
    name: "FreePhone",
    url: "https://freephone.citec.app",
    urlLabel: "freephone.citec.app",
    color: "#a78bfa",
    ico: "📱",
    tagline: "Vérification IMEI et déblocage de téléphones.",
    forWho: "Particuliers, revendeurs et réparateurs de téléphones.",
    points: [
      "Vérification d'un téléphone par son IMEI (iCloud, liste noire, opérateur)",
      "Déblocage réseau par IMEI",
      "Paiement par Mobile Money (Orange Money)",
      "Suivi de la commande en ligne",
      "Accès revendeurs avec portefeuille et API",
    ],
    cta: "Vérifier un téléphone",
  },
];

export const SUBJECTS = ["Simple Pos", "2MT Shopping", "FreePhone", "Partenariat", "Recrutement", "Autre"];
