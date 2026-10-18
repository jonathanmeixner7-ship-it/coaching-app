// Übungsbibliothek und Vorlagen für freie Tage. Muskeln: siehe BODY.NAMES.
// m = Hauptmuskeln, s = hilft mit, ort: zuhause | studio | beides, kat: kraft | mobility | ausdauer | ems
const EX = [
  // Zuhause, ohne Geräte
  {id:'kniebeuge_stuhl', anim:'squatChair', name:'Kniebeuge zum Stuhl', m:['oberschenkel_vorne','po'], s:['bauch'], ort:'zuhause', kat:'kraft', geraet:'Stuhl', sets:3, reps:'10–12',
   steps:['Vor einen Stuhl stellen, Füße hüftbreit, Zehen leicht nach außen.','Po nach hinten schieben, als ob du dich setzen willst, bis er den Stuhl kurz berührt.','Über die ganze Fußsohle kraftvoll wieder aufstehen.'],
   tip:'Knie zeigen in Richtung der Zehen, Oberkörper bleibt stolz aufgerichtet.', fehler:'Knie fallen nach innen oder du plumpst auf den Stuhl.'},
  {id:'kniebeuge', anim:'squat', name:'Kniebeuge', m:['oberschenkel_vorne','po'], s:['oberschenkel_hinten','bauch'], ort:'beides', kat:'kraft', geraet:'ohne', sets:3, reps:'12–15',
   steps:['Füße schulterbreit, Arme nach vorne.','Hüfte nach hinten und unten, so tief wie es sauber geht.','Aus den Fersen hochdrücken.'],
   tip:'Ganzer Fuß bleibt am Boden.', fehler:'Rücken rundet sich unten.'},
  {id:'ausfallschritt', anim:'lunge', name:'Ausfallschritt nach hinten', m:['oberschenkel_vorne','po'], s:['oberschenkel_hinten','waden'], ort:'beides', kat:'kraft', geraet:'ohne', sets:3, reps:'8–10 pro Seite',
   steps:['Aufrecht stehen, bei Bedarf an der Wand festhalten.','Ein Bein großen Schritt nach hinten, hinteres Knie Richtung Boden.','Mit dem vorderen Bein zurück in den Stand drücken.'],
   tip:'Schritt nach hinten ist knieschonender als nach vorne.', fehler:'Vorderes Knie schiebt weit über die Zehen.'},
  {id:'bruecke', anim:'bridge', name:'Beckenheben (Brücke)', m:['po'], s:['oberschenkel_hinten','unterer_ruecken'], ort:'zuhause', kat:'kraft', geraet:'Matte', sets:3, reps:'12–15',
   steps:['Rückenlage, Füße hüftbreit aufgestellt, Arme neben dem Körper.','Po anspannen und Becken anheben, bis Knie, Hüfte und Schultern eine Linie bilden.','2 Sekunden halten, langsam absenken.'],
   tip:'Druck über die Fersen, nicht ins Hohlkreuz drücken.', fehler:'Zu hoch heben und den unteren Rücken überstrecken.'},
  {id:'wandliegestuetz', anim:'wallPush', name:'Liegestütz an der Wand', m:['brust'], s:['trizeps','schultern'], ort:'zuhause', kat:'kraft', geraet:'Wand', sets:3, reps:'12–15',
   steps:['Eine Armlänge vor die Wand stellen, Hände auf Schulterhöhe.','Körper gerade halten und Brust Richtung Wand senken.','Kraftvoll zurückdrücken.'],
   tip:'Je weiter die Füße weg sind, desto schwerer.', fehler:'Hüfte knickt ein.'},
  {id:'liegestuetz_knie', anim:'kneePush', name:'Liegestütz auf den Knien', m:['brust'], s:['trizeps','schultern','bauch'], ort:'beides', kat:'kraft', geraet:'Matte', sets:3, reps:'8–12',
   steps:['Hände etwas breiter als schulterbreit, Knie am Boden.','Körper von Kopf bis Knie gerade, Brust zum Boden senken.','Hochdrücken, Ellbogen schräg nach hinten.'],
   tip:'Bauch fest, als würdest du gleich angestupst.', fehler:'Ellbogen zeigen weit zur Seite.'},
  {id:'vierfuessler', anim:'birddog', name:'Vierfüßler diagonal (Bird Dog)', m:['unterer_ruecken','po'], s:['schultern','bauch'], ort:'zuhause', kat:'kraft', geraet:'Matte', sets:3, reps:'8 pro Seite',
   steps:['Vierfüßlerstand: Hände unter den Schultern, Knie unter der Hüfte.','Rechten Arm und linkes Bein lang ausstrecken.','Kurz halten, langsam zurück, Seite wechseln.'],
   tip:'Stell dir ein Glas Wasser auf dem Rücken vor.', fehler:'Bein zu hoch heben, Hohlkreuz.'},
  {id:'katzekuh', anim:'catcow', name:'Katze-Kuh', m:['unterer_ruecken'], s:['ruecken_oben','bauch'], ort:'zuhause', kat:'mobility', geraet:'Matte', sets:2, reps:'10 langsam',
   steps:['Vierfüßlerstand.','Ausatmen: Rücken rund machen, Kinn zur Brust.','Einatmen: Brust nach vorne, Blick leicht nach oben.'],
   tip:'Langsam und mit dem Atem, kein Kraftakt.', fehler:'Zu schnell und ruckartig.'},
  {id:'plank', anim:'plank', name:'Unterarmstütz (Plank)', m:['bauch'], s:['schultern','seitlich'], ort:'beides', kat:'kraft', geraet:'Matte', sets:3, reps:'30 s',
   steps:['Unterarme unter den Schultern, Beine lang (leichter: Knie am Boden).','Körper bildet eine gerade Linie.','Ruhig weiteratmen und halten.'],
   tip:'Po leicht anspannen, Bauchnabel zur Wirbelsäule.', fehler:'Hüfte hängt durch.'},
  {id:'seitstuetz', anim:'sidePlank', name:'Seitstütz', m:['seitlich'], s:['schultern','po'], ort:'beides', kat:'kraft', geraet:'Matte', sets:2, reps:'20 s pro Seite',
   steps:['Seitlage, Unterarm unter der Schulter, Knie gebeugt (schwerer: Beine lang).','Hüfte anheben, bis der Körper gerade ist.','Halten, Seite wechseln.'],
   tip:'Bei Skoliose die schwächere Seite zuerst.', fehler:'Hüfte sackt nach hinten.'},
  {id:'deadbug', anim:'deadbug', name:'Dead Bug', m:['bauch'], s:['seitlich'], ort:'zuhause', kat:'kraft', geraet:'Matte', sets:3, reps:'8 pro Seite',
   steps:['Rückenlage, Arme nach oben, Beine im 90-Grad-Winkel.','Unteren Rücken fest in die Matte drücken.','Gegengleich Arm und Bein langsam strecken, zurück, Seite wechseln.'],
   tip:'Nur so weit strecken, wie der Rücken am Boden bleibt.', fehler:'Hohlkreuz beim Strecken.'},
  {id:'wadenheben', anim:'calf', name:'Wadenheben', m:['waden'], s:[], ort:'beides', kat:'kraft', geraet:'Treppenstufe', sets:3, reps:'15',
   steps:['Mit den Fußballen auf eine Stufe, an der Wand festhalten.','Fersen so hoch wie möglich heben.','Langsam unter Stufenhöhe absenken.'],
   tip:'Oben kurz halten.', fehler:'Zu schnell wippen.'},
  {id:'superman', anim:'superman', name:'Rückenstrecker im Liegen', m:['unterer_ruecken'], s:['ruecken_oben','po'], ort:'zuhause', kat:'kraft', geraet:'Matte', sets:3, reps:'10',
   steps:['Bauchlage, Stirn auf den Händen oder Arme nach vorne.','Brust und Arme leicht anheben, Blick zum Boden.','2 Sekunden halten, ablegen.'],
   tip:'Klein und kontrolliert reicht völlig.', fehler:'Kopf in den Nacken reißen.'},
  {id:'wandsitzen', anim:'wallSit', name:'Wandsitzen', m:['oberschenkel_vorne'], s:['po'], ort:'zuhause', kat:'kraft', geraet:'Wand', sets:3, reps:'30 s',
   steps:['Rücken an die Wand, Füße einen Schritt vor.','Runterrutschen, bis die Knie etwa im rechten Winkel sind.','Position halten.'],
   tip:'Weniger tief = leichter.', fehler:'Knie weiter vorne als die Zehen.'},
  {id:'stepup', anim:'stepup', name:'Step-ups auf der Treppe', m:['oberschenkel_vorne','po'], s:['waden'], ort:'zuhause', kat:'kraft', geraet:'Treppe', sets:3, reps:'10 pro Seite',
   steps:['Vor eine Stufe stellen, Geländer greifen.','Ganzen Fuß auf die Stufe, hochdrücken.','Kontrolliert wieder runter.'],
   tip:'Die Kraft kommt aus dem oberen Bein.', fehler:'Mit dem unteren Bein abfedern.'},
  {id:'einbeinstand', anim:'balance', name:'Einbeinstand (Balance)', m:['waden','po'], s:['bauch'], ort:'zuhause', kat:'kraft', geraet:'ohne', sets:2, reps:'30 s pro Seite',
   steps:['Neben eine Stuhllehne stellen.','Ein Bein leicht anheben, aufrecht bleiben.','Wenn sicher: Hand lösen oder Augen kurz schließen.'],
   tip:'Beugt Stürzen vor, ideal ab 40.', fehler:'Hüfte kippt zur Seite.'},
  // Beweglichkeit
  {id:'brustoeffner', anim:'chestOpen', name:'Schulterkreisen & Brustöffner', m:['schultern','brust'], s:['ruecken_oben'], ort:'zuhause', kat:'mobility', geraet:'ohne', sets:2, reps:'10',
   steps:['Aufrecht stehen, Schultern groß nach hinten kreisen.','Hände hinter dem Rücken verschränken.','Brust öffnen, Schulterblätter zusammen, 20 s halten.'],
   tip:'Super nach langem Sitzen.', fehler:'Hochgezogene Schultern.'},
  {id:'hueftbeuger', anim:'hipFlexor', name:'Hüftbeuger-Dehnung im Kniestand', m:['oberschenkel_vorne'], s:['bauch'], ort:'zuhause', kat:'mobility', geraet:'Matte', sets:2, reps:'30 s pro Seite',
   steps:['Halber Kniestand, hinteres Knie auf einem Kissen.','Po anspannen, Becken leicht nach vorne schieben.','Dehnung vorne an der Hüfte halten.'],
   tip:'Aufrecht bleiben, nicht ins Hohlkreuz.', fehler:'Nur nach vorne lehnen.'},
  {id:'offenesbuch', anim:'openBook', name:'Offenes Buch (Brustwirbel-Rotation)', m:['ruecken_oben'], s:['brust','schultern'], ort:'zuhause', kat:'mobility', geraet:'Matte', sets:2, reps:'8 pro Seite',
   steps:['Seitlage, Knie angewinkelt, Arme gestreckt übereinander.','Oberen Arm wie ein Buch zur anderen Seite aufklappen.','Blick folgt der Hand, langsam zurück.'],
   tip:'Knie bleiben aufeinander liegen.', fehler:'Mit Schwung drehen.'},
  // Mit Band
  {id:'band_rudern', anim:'row', name:'Rudern mit Band', m:['latissimus','ruecken_oben'], s:['bizeps'], ort:'zuhause', kat:'kraft', geraet:'Fitnessband', sets:3, reps:'12–15',
   steps:['Band um einen festen Gegenstand oder die Füße legen.','Enden zur Hüfte ziehen, Ellbogen eng am Körper.','Schulterblätter zusammen, langsam nachgeben.'],
   tip:'Brust raus, Schultern weg von den Ohren.', fehler:'Mit dem Oberkörper nach hinten lehnen.'},
  {id:'band_pullapart', anim:'pullApart', name:'Band auseinanderziehen', m:['ruecken_oben','schultern'], s:[], ort:'zuhause', kat:'kraft', geraet:'Fitnessband', sets:3, reps:'15',
   steps:['Band schulterbreit vor der Brust halten, Arme gestreckt.','Band auseinanderziehen, bis es die Brust berührt.','Kontrolliert zurück.'],
   tip:'Gut für die Haltung.', fehler:'Hohlkreuz machen.'},
  {id:'band_seitgehen', anim:'sideWalk', name:'Seitgehen mit Miniband', m:['po'], s:['oberschenkel_vorne'], ort:'zuhause', kat:'kraft', geraet:'Miniband', sets:3, reps:'10 Schritte pro Seite',
   steps:['Miniband über den Knien, leicht in die Hocke.','Kleine Schritte zur Seite, Band bleibt gespannt.','Zurück in die andere Richtung.'],
   tip:'Knie nach außen drücken.', fehler:'Füße schlagen zusammen.'},
  {id:'band_bizeps', anim:'curl', name:'Bizepscurl mit Band', m:['bizeps'], s:['unterarme'], ort:'zuhause', kat:'kraft', geraet:'Fitnessband', sets:3, reps:'12',
   steps:['Auf das Band stellen, Enden greifen.','Unterarme beugen, Ellbogen bleiben am Körper.','Langsam ablassen.'],
   tip:'Kein Schwung aus dem Rücken.', fehler:'Ellbogen wandern nach vorne.'},
  // Studio / Kurzhantel
  {id:'goblet', anim:'goblet', name:'Goblet Squat', m:['oberschenkel_vorne','po'], s:['bauch'], ort:'studio', kat:'kraft', geraet:'Kurzhantel', sets:3, reps:'8–12',
   steps:['Kurzhantel senkrecht vor der Brust halten.','Tief in die Hocke, Ellbogen zwischen den Knien.','Aus den Fersen hochdrücken.'],
   tip:'Hantel nah am Körper.', fehler:'Fersen heben ab.'},
  {id:'rdl', anim:'rdl', name:'Rumänisches Kreuzheben', m:['oberschenkel_hinten','po'], s:['unterer_ruecken'], ort:'studio', kat:'kraft', geraet:'Kurzhanteln', sets:3, reps:'8–10',
   steps:['Hanteln vor den Oberschenkeln, Knie leicht gebeugt.','Hüfte nach hinten schieben, Hanteln am Bein entlang nach unten.','Bei Dehnung hinten am Bein aufrichten, Po anspannen.'],
   tip:'Rücken bleibt die ganze Zeit gerade.', fehler:'Runder Rücken.'},
  {id:'kh_rudern', anim:'dbRow', name:'Kurzhantel-Rudern einarmig', m:['latissimus'], s:['ruecken_oben','bizeps'], ort:'studio', kat:'kraft', geraet:'Kurzhantel, Bank', sets:3, reps:'10 pro Seite',
   steps:['Knie und Hand auf der Bank, Rücken gerade.','Hantel zur Hüfte ziehen.','Langsam ablassen, Schulter bleibt stabil.'],
   tip:'Ellbogen Richtung Hosentasche.', fehler:'Oberkörper aufdrehen.'},
  {id:'kh_schulter', anim:'press', name:'Schulterdrücken Kurzhantel', m:['schultern'], s:['trizeps'], ort:'studio', kat:'kraft', geraet:'Kurzhanteln', sets:3, reps:'8–12',
   steps:['Sitzend, Hanteln auf Schulterhöhe.','Nach oben drücken, ohne die Arme ganz durchzustrecken.','Kontrolliert zurück.'],
   tip:'Bauch fest, kein Hohlkreuz.', fehler:'Zu schwere Gewichte mit Schwung.'},
  {id:'bankdruecken', anim:'bench', name:'Bankdrücken', m:['brust'], s:['trizeps','schultern'], ort:'studio', kat:'kraft', geraet:'Langhantel oder Kurzhanteln', sets:3, reps:'6–10',
   steps:['Rückenlage auf der Bank, Füße fest am Boden, Schulterblätter zusammen.','Gewicht zur unteren Brust senken.','Kraftvoll nach oben drücken.'],
   tip:'Mit Partner sichern lassen.', fehler:'Po hebt von der Bank ab.'},
  {id:'latzug', anim:'latPull', name:'Latzug', m:['latissimus'], s:['bizeps','ruecken_oben'], ort:'studio', kat:'kraft', geraet:'Kabelzug', sets:3, reps:'10–12',
   steps:['Stange etwas breiter als schulterbreit greifen.','Zur oberen Brust ziehen, Brust raus.','Langsam nach oben führen lassen.'],
   tip:'Erst Schulterblätter nach unten, dann ziehen.', fehler:'Hinter den Nacken ziehen.'},
  {id:'beinpresse', anim:'legPress', name:'Beinpresse', m:['oberschenkel_vorne','po'], s:['oberschenkel_hinten'], ort:'studio', kat:'kraft', geraet:'Gerät', sets:3, reps:'10–12',
   steps:['Füße hüftbreit mittig auf der Platte.','Langsam beugen, bis die Knie etwa 90 Grad haben.','Drücken, Knie nicht ganz durchstrecken.'],
   tip:'Unterer Rücken bleibt am Polster.', fehler:'Knie fallen nach innen.'},
  {id:'trizeps_kabel', anim:'pushdown', name:'Trizepsdrücken am Kabel', m:['trizeps'], s:[], ort:'studio', kat:'kraft', geraet:'Kabelzug', sets:3, reps:'12',
   steps:['Seil oder Stange greifen, Ellbogen am Körper.','Nach unten strecken.','Langsam zurück bis Unterarme waagerecht.'],
   tip:'Nur der Unterarm bewegt sich.', fehler:'Mit dem Oberkörper mitdrücken.'},
  {id:'kh_bizeps', anim:'curlDb', name:'Bizepscurl Kurzhantel', m:['bizeps'], s:['unterarme'], ort:'studio', kat:'kraft', geraet:'Kurzhanteln', sets:3, reps:'10–12',
   steps:['Aufrecht, Hanteln seitlich, Handflächen nach vorne.','Hanteln zur Schulter beugen.','Langsam ablassen.'],
   tip:'Ellbogen bleiben ruhig.', fehler:'Schwung aus der Hüfte.'},
  // Ausdauer
  {id:'spaziergang', anim:'walk', name:'Zügiger Spaziergang', m:['oberschenkel_vorne','waden'], s:['po','oberschenkel_hinten'], ort:'draussen', kat:'ausdauer', geraet:'gute Schuhe', sets:1, reps:'30 min',
   steps:['Locker starten, nach 5 Minuten Tempo steigern.','So schnell, dass du noch sprechen, aber nicht singen kannst.','Arme aktiv mitschwingen, aufrecht gehen.'],
   tip:'Nach dem Essen besonders gut für den Blutzucker.', fehler:'Nur schlendern.'},
  {id:'radfahren', anim:'bike', name:'Radfahren', m:['oberschenkel_vorne'], s:['waden','po','oberschenkel_hinten'], ort:'draussen', kat:'ausdauer', geraet:'Fahrrad', sets:1, reps:'30–45 min',
   steps:['Sattelhöhe: Bein unten fast gestreckt.','Lockeres, gleichmäßiges Tempo.','Lieber leichter Gang und schneller treten.'],
   tip:'Gelenkschonend, ideal zwischen den EMS-Terminen.', fehler:'Zu schwerer Gang am Berg.'},
  {id:'nordic', anim:'nordic', name:'Nordic Walking', m:['latissimus','oberschenkel_vorne'], s:['schultern','trizeps','waden'], ort:'draussen', kat:'ausdauer', geraet:'Stöcke', sets:1, reps:'30–45 min',
   steps:['Stöcke schräg nach hinten einsetzen.','Gegengleich: rechter Arm, linkes Bein.','Hände öffnen beim Abdrücken hinten.'],
   tip:'Trainiert auch den Oberkörper.', fehler:'Stöcke nur hinterherziehen.'},
  {id:'treppen', anim:'stepup', name:'Treppensteigen', m:['oberschenkel_vorne','po'], s:['waden'], ort:'zuhause', kat:'ausdauer', geraet:'Treppe', sets:1, reps:'10 min',
   steps:['Zügig nach oben, ganzer Fuß auf die Stufe.','Langsam wieder runter.','Wiederholen, Geländer wenn nötig.'],
   tip:'Kleine Einheit für zwischendurch.', fehler:'Nur auf den Zehen.'},
  {id:'ems', anim:'squat', name:'EMS-Training bei tenless', m:['brust','bauch','oberschenkel_vorne','po','latissimus','unterer_ruecken'], s:['schultern','bizeps','trizeps','oberschenkel_hinten','waden','ruecken_oben'], ort:'studio', kat:'ems', geraet:'EMS-Anzug', sets:1, reps:'20 min',
   steps:['Viel trinken vor und nach dem Training.','Dein Trainer stellt die Intensität ein.','Saubere Bewegungen, ruhig atmen.'],
   tip:'Am Tag danach ist ein Spaziergang ideal für die Erholung.', fehler:'Mit leerem Magen oder zu wenig getrunken kommen.'}
];
const EXMAP = Object.fromEntries(EX.map(e => [e.id, e]));

// Vorlagen für freie Tage (vor allem für tenless-Kunden zwischen den EMS-Terminen)
const ROUTINES = [
  // Zuhause
  {id:'ruecken', ort:'zuhause', name:'Rücken-Fit', min:15, info:'Für einen starken, beweglichen Rücken', items:[['katzekuh',2,'10'],['vierfuessler',3,'8 pro Seite'],['bruecke',3,'12'],['superman',3,'10'],['offenesbuch',2,'8 pro Seite']]},
  {id:'unterer_ruecken', ort:'zuhause', name:'Unterer Rücken stark', min:15, info:'Entlastet den Rücken nach langem Sitzen', items:[['katzekuh',2,'10'],['bruecke',3,'15'],['deadbug',3,'8 pro Seite'],['vierfuessler',3,'8 pro Seite'],['seitstuetz',2,'20 s pro Seite']]},
  {id:'mobility', ort:'zuhause', name:'Mobility am Morgen', min:10, info:'Locker werden nach dem Aufstehen', items:[['brustoeffner',2,'10'],['katzekuh',2,'10'],['hueftbeuger',2,'30 s pro Seite'],['offenesbuch',2,'8 pro Seite']]},
  {id:'gk_mobility', ort:'zuhause', name:'Ganzkörper-Beweglichkeit', min:15, info:'Von Kopf bis Fuß beweglicher werden', items:[['brustoeffner',2,'10'],['katzekuh',2,'10'],['offenesbuch',2,'8 pro Seite'],['hueftbeuger',2,'30 s pro Seite'],['vierfuessler',2,'6 pro Seite'],['wadenheben',2,'12']]},
  {id:'gk_home', ort:'zuhause', name:'Ganzkörper zuhause', min:20, info:'Alle großen Muskeln, nur ein Band nötig', items:[['kniebeuge',3,'12'],['liegestuetz_knie',3,'8–10'],['band_rudern',3,'12'],['ausfallschritt',2,'8 pro Seite'],['plank',3,'30 s'],['bruecke',2,'15']]},
  {id:'beine', ort:'zuhause', name:'Beine & Po zuhause', min:20, info:'Ohne Geräte, nur ein Stuhl', items:[['kniebeuge_stuhl',3,'12'],['ausfallschritt',3,'8 pro Seite'],['bruecke',3,'15'],['wadenheben',3,'15'],['wandsitzen',2,'30 s']]},
  {id:'rumpf', ort:'zuhause', name:'Bauch & Rumpf', min:15, info:'Starke Mitte, schützt den Rücken', items:[['deadbug',3,'8 pro Seite'],['plank',3,'30 s'],['seitstuetz',2,'20 s pro Seite'],['vierfuessler',2,'8 pro Seite'],['superman',2,'10']]},
  {id:'haltung', ort:'zuhause', name:'Haltung & Schultern', min:15, info:'Gegen Rundrücken und verspannte Schultern', items:[['brustoeffner',2,'10'],['band_pullapart',3,'15'],['band_rudern',3,'12'],['wandliegestuetz',3,'12'],['offenesbuch',2,'8 pro Seite']]},
  {id:'oberkoerper', ort:'zuhause', name:'Oberkörper mit Band', min:20, info:'Haltung und Kraft mit einem Fitnessband', items:[['wandliegestuetz',3,'12'],['band_rudern',3,'15'],['band_pullapart',3,'15'],['band_bizeps',2,'12'],['plank',3,'30 s']]},
  {id:'kreislauf', ort:'zuhause', name:'Kreislauf & Beine', min:20, info:'Bringt den Puls hoch, ganz ohne Geräte', items:[['treppen',1,'5 min'],['stepup',3,'10 pro Seite'],['kniebeuge',3,'15'],['band_seitgehen',2,'10 Schritte pro Seite'],['wadenheben',2,'15']]},
  {id:'balance', ort:'zuhause', name:'Balance & Kraft 40+', min:15, info:'Standfest im Alltag, beugt Stürzen vor', items:[['einbeinstand',2,'30 s pro Seite'],['stepup',3,'10 pro Seite'],['wandsitzen',3,'30 s'],['seitstuetz',2,'20 s pro Seite'],['wadenheben',3,'15']]},
  // Studio
  {id:'studio_gk', ort:'studio', name:'Studio Ganzkörper', min:40, info:'Der Klassiker: einmal alles', items:[['goblet',3,'10'],['bankdruecken',3,'8–10'],['latzug',3,'10–12'],['rdl',3,'10'],['kh_schulter',2,'10'],['plank',2,'40 s']]},
  {id:'studio_ok', ort:'studio', name:'Studio Oberkörper', min:35, info:'Brust, Rücken, Schultern, Arme', items:[['bankdruecken',3,'8–10'],['kh_rudern',3,'10 pro Seite'],['kh_schulter',3,'10'],['latzug',3,'10–12'],['trizeps_kabel',2,'12'],['kh_bizeps',2,'12']]},
  {id:'studio_beine', ort:'studio', name:'Studio Beine & Po', min:35, info:'Kräftige Beine, starker Po', items:[['beinpresse',3,'10–12'],['rdl',3,'10'],['goblet',3,'10'],['ausfallschritt',2,'8 pro Seite'],['wadenheben',3,'15']]}
];
const KAT = {kraft:'Kraft', mobility:'Beweglichkeit', ausdauer:'Ausdauer', ems:'EMS'};
const ORT = {zuhause:'Zuhause', studio:'Studio', beides:'Zuhause & Studio', draussen:'Draußen'};

// Muskel-Stufen aus einer Übungsliste [{ex, …}] berechnen
function muscleLevels(list){
  const lv = {};
  for (const it of list) {
    const e = EXMAP[it.ex || it]; if (!e) continue;
    e.s.forEach(k => { lv[k] = Math.max(lv[k] || 0, 0.5); });
    e.m.forEach(k => { lv[k] = 1; });
  }
  return lv;
}
// Zeitangabe ("30 s", "20 s pro Seite") in Sekunden, sonst null
function secondsOf(reps){ const m = /^(\d+)\s*s\b/.exec(String(reps).trim()); return m ? +m[1] : null; }
