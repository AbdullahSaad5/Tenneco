// ============================================================================
// Hotspot Configuration - Matches HotspotConfiguration interface from content.ts
// ============================================================================
// NOTE: All hotspot position values are in MODEL-LOCAL SPACE.
// They automatically scale with viewerScale changes.
// Use the Brake Coordinate Helper (/brake-coordinate-helper) to capture positions.
// ============================================================================

import { HotspotConfiguration } from "../_types/content";

/**
 * Light vehicle hotspot configuration
 */
export const HOTSPOT_CONFIG_LIGHT: HotspotConfiguration = {
  id: "hotspot-light-static",
  vehicleType: "light",
  defaults: {
    pdf: "./documents/default-brake-info.pdf",
    video: "./videos/default-brake-overview.mp4",
  },
  hotspots: [
    {
      hotspotId: "hotspot-1",
      label: "Brake Caliper Assembly",
      labelTranslations: [
        { language: "it", value: "Assemblaggio Pinza Freno" },
      ],
      position: { x: 5, y: 5.5, z: 0 },
      color: "#012e87",
      isEnabled: true,
      info: {
        title: "Hydraulic Brake Caliper Assembly",
        titleTranslations: [
          { language: "it", value: "Assemblaggio Pinza Freno Idraulica" },
        ],
        description: "The brake caliper houses the brake pads and pistons. When hydraulic pressure is applied, the caliper squeezes the brake pads against the rotor disc, creating the friction needed to slow your vehicle. This precision-engineered component features corrosion-resistant coating and optimized heat dissipation for consistent performance in everyday driving conditions, from city traffic to highway speeds.",
        descriptionTranslations: [
          { language: "it", value: "La pinza freno ospita le pastiglie e i pistoni. Quando viene applicata la pressione idraulica, la pinza stringe le pastiglie contro il disco del rotore, creando l'attrito necessario per rallentare il veicolo." },
        ],
        pdf: "./documents/light-caliper-specs.pdf",
      },
    },
    {
      hotspotId: "hotspot-2",
      label: "Brake Rotor Disc",
      labelTranslations: [
        { language: "it", value: "Disco Rotore Freno" },
      ],
      position: { x: -5, y: 15, z: 5 },
      color: "#012e87",
      isEnabled: true,
      info: {
        title: "Ventilated Brake Rotor Disc",
        titleTranslations: [
          { language: "it", value: "Disco Rotore Freno Ventilato" },
        ],
        description: "The brake rotor is a metal disc that rotates with the wheel. When the brake pads clamp down on it, friction converts kinetic energy into heat, slowing the vehicle. This ventilated design features internal cooling vanes that improve heat dissipation during repeated braking, preventing brake fade and maintaining optimal stopping power. Surface treated for enhanced durability and reduced noise.",
        descriptionTranslations: [
          { language: "it", value: "Il rotore del freno è un disco metallico che ruota con la ruota. Quando le pastiglie si stringono su di esso, l'attrito converte l'energia cinetica in calore, rallentando il veicolo." },
        ],
        video: "./videos/rotor-technology.mp4",
      },
    },
    {
      hotspotId: "hotspot-3",
      label: "Ceramic Brake Pad",
      labelTranslations: [
        { language: "it", value: "Pastiglia Freno in Ceramica" },
      ],
      position: { x: 0, y: 2.5, z: 10 },
      color: "#012e87",
      isEnabled: true,
      info: {
        title: "Low-Dust Ceramic Brake Pad",
        titleTranslations: [
          { language: "it", value: "Pastiglia Freno in Ceramica a Bassa Polvere" },
        ],
        description: "Advanced ceramic friction material engineered for passenger vehicles. These pads offer superior stopping power while generating minimal dust and noise. The ceramic compound remains stable across a wide temperature range, providing consistent braking feel in all weather conditions. Extended pad life reduces maintenance frequency, and the low-metallic formula helps preserve rotor life while keeping wheels cleaner.",
        descriptionTranslations: [
          { language: "it", value: "Materiale di attrito ceramico avanzato progettato per veicoli passeggeri. Queste pastiglie offrono una potenza di arresto superiore generando minima polvere e rumore." },
        ],
      },
    },
    {
      hotspotId: "hotspot-4",
      label: "Master Cylinder",
      labelTranslations: [
        { language: "it", value: "Cilindro Principale" },
      ],
      position: { x: -5, y: 10, z: -5 },
      color: "#012e87",
      isEnabled: true,
      info: {
        title: "Brake Master Cylinder",
        titleTranslations: [
          { language: "it", value: "Cilindro Principale del Freno" },
        ],
        description: "The master cylinder is the heart of your hydraulic brake system. When you press the brake pedal, it converts mechanical force into hydraulic pressure, pushing brake fluid through the lines to each wheel. This dual-circuit design ensures that even if one circuit fails, the other remains operational for safety. Equipped with a fluid reservoir and pressure sensors for modern vehicle integration.",
        descriptionTranslations: [
          { language: "it", value: "Il cilindro principale è il cuore del sistema frenante idraulico. Quando si preme il pedale del freno, converte la forza meccanica in pressione idraulica." },
        ],
        pdf: "./documents/master-cylinder-maintenance.pdf",
      },
    },
    {
      hotspotId: "hotspot-5",
      label: "Brake Lines",
      labelTranslations: [
        { language: "it", value: "Tubazioni Freno" },
      ],
      position: { x: 6, y: -8.5, z: 7.5 },
      color: "#012e87",
      isEnabled: true,
      info: {
        title: "High-Pressure Brake Lines",
        titleTranslations: [
          { language: "it", value: "Tubazioni Freno ad Alta Pressione" },
        ],
        description: "Brake lines transport hydraulic fluid from the master cylinder to each brake caliper. These reinforced steel and rubber hoses are engineered to withstand extreme pressure fluctuations while maintaining flexibility for suspension movement. Protected against corrosion and abrasion, they feature multiple layers including an inner tube, braided reinforcement, and protective outer coating to ensure leak-free operation throughout the vehicle's lifetime.",
        descriptionTranslations: [
          { language: "it", value: "Le tubazioni freno trasportano il fluido idraulico dal cilindro principale a ciascuna pinza freno." },
        ],
      },
    },
    {
      hotspotId: "hotspot-6",
      label: "ABS Sensor",
      labelTranslations: [
        { language: "it", value: "Sensore ABS" },
      ],
      position: { x: 2.5, y: -5, z: -7.5 },
      color: "#012e87",
      isEnabled: true,
      info: {
        title: "Anti-Lock Brake System Sensor",
        titleTranslations: [
          { language: "it", value: "Sensore Sistema Frenante Antibloccaggio" },
        ],
        description: "The ABS wheel speed sensor continuously monitors wheel rotation speed, detecting when a wheel is about to lock up during hard braking. This data is sent to the ABS control module which modulates brake pressure up to 15 times per second, preventing wheel lockup and maintaining steering control. Essential for modern vehicle safety, working seamlessly with stability control and traction systems.",
        descriptionTranslations: [
          { language: "it", value: "Il sensore di velocità della ruota ABS monitora continuamente la velocità di rotazione della ruota, rilevando quando una ruota sta per bloccarsi durante una frenata brusca." },
        ],
        video: "./videos/abs-technology-explained.mp4",
      },
    },
    {
      hotspotId: "hotspot-7",
      label: "Parking Brake",
      labelTranslations: [
        { language: "it", value: "Freno di Stazionamento" },
      ],
      position: { x: -7.5, y: -0.5, z: 10 },
      color: "#012e87",
      isEnabled: true,
      info: {
        title: "Electronic Parking Brake System",
        titleTranslations: [
          { language: "it", value: "Sistema Freno di Stazionamento Elettronico" },
        ],
        description: "The electronic parking brake replaces traditional handbrake cables with an electric motor-driven system. Activated by a simple button press, it automatically applies optimal clamping force to the rear brake calipers, holding your vehicle securely on slopes. Features automatic release when you accelerate, hill-hold assist integration, and emergency braking capability if pulled while driving at low speeds.",
        descriptionTranslations: [
          { language: "it", value: "Il freno di stazionamento elettronico sostituisce i cavi tradizionali del freno a mano con un sistema azionato da motore elettrico." },
        ],
        pdf: "./documents/parking-brake-guide.pdf",
      },
    },
  ],
};

/**
 * Commercial vehicle hotspot configuration
 */
export const HOTSPOT_CONFIG_COMMERCIAL: HotspotConfiguration = {
  id: "hotspot-commercial-static",
  vehicleType: "commercial",
  defaults: {
    pdf: "./documents/default-brake-info.pdf",
    video: "./videos/default-brake-overview.mp4",
  },
  hotspots: [
    {
      hotspotId: "hotspot-1",
      label: "Heavy-Duty Caliper",
      labelTranslations: [
        { language: "it", value: "Pinza per Impieghi Gravosi" },
      ],
      position: { x: 10, y: 5, z: 0 },
      color: "#012e87",
      isEnabled: true,
      info: {
        title: "Commercial Grade Brake Caliper",
        titleTranslations: [
          { language: "it", value: "Pinza Freno di Grado Commerciale" },
        ],
        description: "Engineered for trucks and commercial vehicles carrying heavy loads. This reinforced caliper assembly features larger pistons and robust construction to handle the extreme forces generated during commercial vehicle braking. Built with high-temperature seals and premium corrosion protection, it delivers reliable performance even under continuous use in demanding fleet operations, construction sites, and long-haul transportation.",
        descriptionTranslations: [
          { language: "it", value: "Progettato per camion e veicoli commerciali che trasportano carichi pesanti. Questo assemblaggio di pinze rinforzate presenta pistoni più grandi e costruzione robusta." },
        ],
        pdf: "./documents/commercial-caliper-maintenance.pdf",
        video: "./videos/heavy-duty-braking.mp4",
      },
    },
    {
      hotspotId: "hotspot-2",
      label: "Heavy-Duty Rotor",
      labelTranslations: [
        { language: "it", value: "Rotore per Impieghi Gravosi" },
      ],
      position: { x: -5, y: 10, z: 5 },
      color: "#012e87",
      isEnabled: true,
      info: {
        title: "Reinforced Commercial Brake Rotor",
        titleTranslations: [
          { language: "it", value: "Rotore Freno Commerciale Rinforzato" },
        ],
        description: "Designed to withstand the intense thermal and mechanical stresses of commercial vehicle operation. This heavy-duty rotor features enhanced metallurgy and increased mass to absorb and dissipate heat more effectively during repeated heavy braking cycles. The optimized cooling vane design ensures stable performance even when hauling maximum loads on steep grades or during emergency stops.",
        descriptionTranslations: [
          { language: "it", value: "Progettato per resistere agli intensi stress termici e meccanici del funzionamento dei veicoli commerciali." },
        ],
      },
    },
    {
      hotspotId: "hotspot-3",
      label: "Semi-Metallic Pad",
      labelTranslations: [
        { language: "it", value: "Pastiglia Semi-Metallica" },
      ],
      position: { x: 0, y: 2.5, z: 10 },
      color: "#012e87",
      isEnabled: true,
      info: {
        title: "Commercial Semi-Metallic Brake Pad",
        titleTranslations: [
          { language: "it", value: "Pastiglia Freno Semi-Metallica Commerciale" },
        ],
        description: "High-performance friction material specifically formulated for commercial vehicle applications. These semi-metallic pads combine superior heat resistance with exceptional fade-free braking, essential for vehicles carrying heavy loads or operating in mountainous terrain. The advanced compound provides consistent coefficient of friction across a broad temperature range while resisting wear to minimize downtime and maximize operational efficiency.",
        descriptionTranslations: [
          { language: "it", value: "Materiale di attrito ad alte prestazioni formulato specificamente per applicazioni su veicoli commerciali." },
        ],
        pdf: "./documents/commercial-pad-specs.pdf",
      },
    },
    {
      hotspotId: "hotspot-4",
      label: "Air Brake Chamber",
      labelTranslations: [
        { language: "it", value: "Camera del Freno ad Aria" },
      ],
      position: { x: -7.5, y: -2.5, z: -5 },
      color: "#012e87",
      isEnabled: true,
      info: {
        title: "Pneumatic Air Brake Chamber",
        titleTranslations: [
          { language: "it", value: "Camera del Freno ad Aria Pneumatica" },
        ],
        description: "Commercial trucks use air brake systems for superior stopping power with heavy loads. The brake chamber converts compressed air pressure into mechanical force that actuates the brake shoes or pads. This spring brake chamber includes both service and parking brake functions - the powerful spring provides fail-safe parking brake operation if air pressure is lost. Designed for millions of cycles in harsh commercial operating environments with minimal maintenance requirements.",
        descriptionTranslations: [
          { language: "it", value: "I camion commerciali utilizzano sistemi frenanti ad aria per una potenza di arresto superiore con carichi pesanti." },
        ],
        video: "./videos/air-brake-system.mp4",
      },
    },
  ],
};

/**
 * Rail vehicle hotspot configuration
 */
export const HOTSPOT_CONFIG_RAIL: HotspotConfiguration = {
  id: "hotspot-rail-static",
  vehicleType: "rail",
  defaults: {
    pdf: "./documents/default-brake-info.pdf",
    video: "./videos/default-brake-overview.mp4",
  },
  hotspots: [
    {
      hotspotId: "hotspot-1",
      label: "Pneumatic Brake Unit",
      labelTranslations: [
        { language: "it", value: "Unità Freno Pneumatica" },
      ],
      position: { x: 10, y: 5, z: 0 },
      color: "#012e87",
      isEnabled: true,
      info: {
        title: "Railway Pneumatic Brake Assembly",
        titleTranslations: [
          { language: "it", value: "Assemblaggio Freno Pneumatico Ferroviario" },
        ],
        description: "The pneumatic brake system is critical for railway safety, using compressed air to apply braking force across multiple rail cars simultaneously. This assembly features fail-safe design principles where air pressure releases the brakes and air loss applies them automatically. Built to exacting railway standards with redundant safety systems, ensuring reliable stopping power for passenger and freight operations in all weather conditions.",
        descriptionTranslations: [
          { language: "it", value: "Il sistema frenante pneumatico è fondamentale per la sicurezza ferroviaria, utilizzando aria compressa per applicare la forza frenante su più vagoni contemporaneamente." },
        ],
        video: "./videos/railway-braking-system.mp4",
      },
    },
    {
      hotspotId: "hotspot-2",
      label: "Brake Disc & Clamp",
      labelTranslations: [
        { language: "it", value: "Disco Freno e Morsetto" },
      ],
      position: { x: -5, y: 10, z: 5 },
      color: "#012e87",
      isEnabled: true,
      info: {
        title: "Rail Brake Disc Assembly",
        titleTranslations: [
          { language: "it", value: "Assemblaggio Disco Freno Ferroviario" },
        ],
        description: "Railway brake discs operate under extreme conditions, dissipating massive amounts of energy when bringing multi-ton trains to a stop from high speeds. This disc features specialized heat-resistant steel alloy construction with enhanced thermal capacity and dimensional stability. The precision-balanced design minimizes vibration while the mounting system accommodates thermal expansion during intensive braking sequences without compromising safety or performance.",
        descriptionTranslations: [
          { language: "it", value: "I dischi freno ferroviari operano in condizioni estreme, dissipando enormi quantità di energia quando fermano treni di più tonnellate da alte velocità." },
        ],
        pdf: "./documents/rail-disc-specifications.pdf",
      },
    },
    {
      hotspotId: "hotspot-3",
      label: "Composite Brake Block",
      labelTranslations: [
        { language: "it", value: "Ceppo Freno Composito" },
      ],
      position: { x: 0, y: 2.5, z: 10 },
      color: "#012e87",
      isEnabled: true,
      info: {
        title: "Railway Composite Brake Block",
        titleTranslations: [
          { language: "it", value: "Ceppo Freno Ferroviario Composito" },
        ],
        description: "Engineered specifically for rail applications, these composite brake blocks provide consistent friction characteristics essential for safe railway operations. The advanced polymer-based compound delivers predictable braking across extreme temperature variations while resisting wear from prolonged high-speed operation. Low noise emission and minimal wheel damage characteristics make them ideal for modern passenger rail systems, meeting stringent international railway safety certifications.",
        descriptionTranslations: [
          { language: "it", value: "Progettati specificamente per applicazioni ferroviarie, questi ceppi freno compositi forniscono caratteristiche di attrito costanti essenziali per operazioni ferroviarie sicure." },
        ],
      },
    },
  ],
};

/**
 * Hotspot configurations keyed by vehicle type
 */
export const HOTSPOT_CONFIGS: Record<string, HotspotConfiguration> = {
  light: HOTSPOT_CONFIG_LIGHT,
  commercial: HOTSPOT_CONFIG_COMMERCIAL,
  rail: HOTSPOT_CONFIG_RAIL,
};
