'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const legalSections = [
  {
    title: "1. Editeur de la plateforme",
    content: [
      "La plateforme WapiBei est un service de marketplace permettant aux utilisateurs de consulter des produits, comparer des offres et entrer en relation avec des vendeurs.",
      "Les informations administratives completes de l'editeur, notamment l'adresse, le numero d'immatriculation et les coordonnees legales, doivent etre completees par l'equipe WapiBei avant publication definitive.",
    ],
  },
  {
    title: "2. Role de WapiBei",
    content: [
      "WapiBei agit comme intermediaire technique entre les acheteurs, les visiteurs et les vendeurs presents sur la plateforme.",
      "Les vendeurs restent responsables des informations, prix, disponibilites, images, descriptions et conditions commerciales qu'ils publient.",
    ],
  },
  {
    title: "3. Donnees personnelles",
    content: [
      "WapiBei peut collecter les donnees necessaires a la creation de compte, a l'authentification, a la gestion des commandes, aux notifications et a l'amelioration du service.",
      "Ces donnees peuvent inclure le nom, l'adresse e-mail, le numero de telephone, le role utilisateur, les preferences de notification et les informations strictement utiles au fonctionnement de la marketplace.",
      "Chaque utilisateur peut demander l'acces, la rectification ou la suppression de ses donnees personnelles en contactant le service client.",
    ],
  },
  {
    title: "4. Utilisation des cookies",
    content: [
      "WapiBei utilise des cookies et technologies similaires pour assurer le bon fonctionnement du site, securiser les sessions, memoriser certains choix utilisateur et mesurer l'utilisation de la plateforme.",
      "Le bandeau de consentement enregistre le choix de l'utilisateur dans le navigateur afin d'eviter d'afficher le message a chaque visite.",
      "Certains cookies techniques peuvent etre indispensables a l'authentification, a la securite ou a l'acces aux espaces reserves.",
    ],
  },
  {
    title: "5. Cookies techniques et consentement",
    content: [
      "Les cookies strictement necessaires au fonctionnement du service peuvent etre utilises sans consentement prealable lorsqu'ils sont indispensables a la fourniture de la plateforme.",
      "Les cookies utilises pour la mesure d'audience, la personnalisation avancee ou la publicite doivent etre controles selon les choix de l'utilisateur lorsque ces fonctionnalites sont activees.",
    ],
  },
  {
    title: "6. Securite",
    content: [
      "WapiBei met en place des mesures raisonnables pour proteger les comptes, limiter les acces non autorises et securiser les operations sensibles.",
      "L'utilisateur reste responsable de la confidentialite de ses identifiants et doit signaler toute utilisation suspecte de son compte.",
    ],
  },
  {
    title: "7. Propriete intellectuelle",
    content: [
      "Les textes, interfaces, logos, elements graphiques, contenus de marque et structures de la plateforme WapiBei sont proteges par les regles applicables a la propriete intellectuelle.",
      "Toute reproduction, modification ou reutilisation non autorisee des elements de la plateforme est interdite.",
    ],
  },
  {
    title: "8. Responsabilites",
    content: [
      "WapiBei s'efforce de maintenir la plateforme accessible et fiable, mais ne peut garantir l'absence permanente d'interruptions, d'erreurs ou d'indisponibilites techniques.",
      "WapiBei ne peut etre tenu responsable des litiges commerciaux entre un acheteur et un vendeur lorsque les informations ou engagements proviennent directement du vendeur.",
    ],
  },
  {
    title: "9. Contact",
    content: [
      "Pour toute question concernant les mentions legales, les cookies ou les donnees personnelles, vous pouvez contacter le service client WapiBei.",
      "E-mail support : contact@wapibei.cd",
      "Telephone : +243 999 123 456",
    ],
  },
];

export default function LegalPage() {
  return (
    <main className="bg-white text-slate-950">
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="container mx-auto max-w-5xl px-6 py-16 md:py-20">
          <div className="flex items-center gap-3 mb-4">
            <Link
              href="/"
              className="size-10 shrink-0 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-[#E67E22] hover:text-white transition-all"
            >
              <ArrowLeft size={18} />
            </Link>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#E67E22]">
              Informations legales
            </p>
          </div>
          <h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
            Mentions legales, confidentialite et politique des cookies
          </h1>
          <p className="mt-6 max-w-3xl text-base font-medium leading-8 text-slate-600">
            Cette page presente les informations principales concernant l'utilisation
            de WapiBei, la gestion des donnees personnelles, les cookies et les
            responsabilites liees a la marketplace.
          </p>
          <p className="mt-4 text-sm font-bold text-slate-500">
            Derniere mise a jour : 8 juin 2026
          </p>
        </div>
      </section>

      <section className="container mx-auto grid max-w-5xl gap-8 px-6 py-14 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-28 space-y-3 border-l-2 border-slate-200 pl-5">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
              Sommaire
            </p>
            {legalSections.map((section) => (
              <a
                key={section.title}
                href={`#${section.title.split(".")[0]}`}
                className="block text-sm font-bold text-slate-600 transition-colors hover:text-[#E67E22]"
              >
                {section.title}
              </a>
            ))}
          </div>
        </aside>

        <div className="space-y-10">
          <div className="rounded-2xl border border-[#E67E22]/20 bg-[#E67E22]/5 p-6">
            <h2 className="text-lg font-black text-slate-950">Note importante</h2>
            <p className="mt-3 text-sm font-medium leading-7 text-slate-700">
              Ce contenu sert de base claire pour le site. Les informations
              officielles de l'entreprise doivent etre verifiees et completees
              avant une mise en production publique.
            </p>
          </div>

          {legalSections.map((section) => (
            <article
              key={section.title}
              id={section.title.split(".")[0]}
              className="border-b border-slate-200 pb-10 last:border-b-0"
            >
              <h2 className="text-2xl font-black tracking-tight text-slate-950">
                {section.title}
              </h2>
              <div className="mt-5 space-y-4">
                {section.content.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-base font-medium leading-8 text-slate-700"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
