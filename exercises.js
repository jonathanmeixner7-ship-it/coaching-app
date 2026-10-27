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

// Studio-Übungen aus dem 5-Tage-Split (Muskelaufbau / Recomp, Trainingspläne/build_split_plan.py)
const S = (id, anim, name, m, s, geraet, sets, reps, steps, tip, fehler) => ({id, anim, name, m, s, ort:'studio', kat:'kraft', geraet, sets, reps, steps, tip, fehler, split:true});
EX.push(
  S('schraegbank_multi','bench','Schrägbankdrücken Multipresse (30°)',['brust'],['schultern','trizeps'],'Multipresse, Schrägbank',3,'12–15',['Bank auf 30° stellen, Stange über der oberen Brust.','Schulterblätter hinten zusammen, Stange kontrolliert zur oberen Brust senken.','Kraftvoll hochdrücken, oben nicht ganz durchstrecken.'],'Startet mit der Schwachstelle obere Brust. Phase 2: 8–12, Phase 3: 6–8 Wdh.','Bank zu steil, dann arbeitet vor allem die Schulter.'),
  S('brustpresse','bench','Brustpresse (Maschine)',['brust'],['trizeps','schultern'],'Maschine',3,'12–15',['Sitz so einstellen, dass die Griffe auf Höhe der Brustmitte sind.','Schulterblätter hinten zusammen, Griffe nach vorne drücken.','Langsam zurück bis zur Dehnung in der Brust.'],'Geführt und gelenkschonend. Phase 2: 8–12, Phase 3: 8–10 Wdh.','Schultern rollen nach vorne.'),
  S('rudermaschine_eng','dbRow','Rudermaschine, enger Griff',['latissimus','ruecken_oben'],['bizeps'],'Maschine',3,'12–15',['Brust ans Polster, Arme vorne ganz lang.','Ellbogen eng am Körper nach hinten ziehen.','Schulterblätter 1 Sekunde zusammendrücken, langsam zurück.'],'Phase 2: 10–12, Phase 3: 8–10 Wdh.','Mit dem Oberkörper Schwung holen.'),
  S('butterfly','pullApart','Kabel-Fliegende / Butterfly',['brust'],['schultern'],'Kabelzug oder Butterfly-Maschine',2,'12–15',['Arme leicht gebeugt, auf Brusthöhe.','Weit öffnen, bis du die Dehnung in der Brust spürst.','Bogenförmig zusammenführen, langsam zurück.'],'Ellbogenwinkel bleibt die ganze Zeit gleich. Phase 3: 10–12 Wdh.','Arme beugen und strecken wie beim Drücken.'),
  S('low_row','row','Low Row am Kabel',['latissimus'],['bizeps','ruecken_oben'],'tiefer Kabelzug',2,'12–15',['Tiefer Kabelzug, Oberkörper leicht nach vorne, Arme lang.','Ellbogen nah am Körper Richtung Hüfte ziehen, nicht zur Brust.','Langsam nach vorne in die Dehnung lassen.'],'Zur Hüfte ziehen trifft den breiten Rückenmuskel. Phase 2/3: 10–12 Wdh.','Zur Brust ziehen, dann arbeitet eher der obere Rücken.'),
  S('kniebeuge_lh','squat','Kniebeuge (Langhantel)',['oberschenkel_vorne','po'],['unterer_ruecken','bauch'],'Langhantel, Rack',3,'12–15',['Stange auf dem oberen Rücken, Füße schulterbreit.','Bauch fest wie vor einem Schlag, Hüfte nach hinten und unten.','Knie Richtung Zehen, aus den Fersen hochdrücken.'],'Phase 2: 8–12, Phase 3: 6–8 Wdh., 2–3 min Pause.','Fersen heben ab oder Knie fallen nach innen.'),
  S('kreuzheben_lh','rdl','Kreuzheben (Langhantel)',['oberschenkel_hinten','po','unterer_ruecken'],['ruecken_oben','unterarme'],'Langhantel',3,'10–12',['Stange über der Fußmitte, Rücken gerade, Brust raus.','Aus den Beinen drücken, Stange bleibt am Körper.','Oben aufrichten, kontrolliert absetzen.'],'Immer mindestens 2 Wdh. Reserve. Phase 2: 6–8, Phase 3: 5–6 Wdh.','Runder Rücken oder Stange weg vom Körper.'),
  S('hip_thrust','bridge','Hip Thrust (Langhantel)',['po'],['oberschenkel_hinten'],'Langhantel, Bank',3,'12–15',['Schulterblätter auf der Bank, Stange auf der Hüfte, Kinn zur Brust.','Becken hoch, bis Oberkörper und Oberschenkel eine Linie bilden.','Oben 1 Sekunde Po fest anspannen, langsam ablassen.'],'Phase 2: 8–12, Phase 3: 8–10 Wdh.','Ins Hohlkreuz drücken statt den Po zu nutzen.'),
  S('beinbeuger_sitzend','legPress','Beinbeuger sitzend',['oberschenkel_hinten'],[],'Maschine',3,'12–15',['Polster knapp über der Ferse, Knie auf Höhe der Drehachse.','Fersen kraftvoll nach unten ziehen.','Langsam zurück in die Dehnung.'],'Sitzend ist der Muskel stärker gedehnt. Phase 2: 10–12, Phase 3: 8–10 Wdh.','Mit Schwung arbeiten.'),
  S('beinstrecker','legPress','Beinstrecker',['oberschenkel_vorne'],[],'Maschine',2,'12–15',['Rücken an der Lehne, Polster vor dem Sprunggelenk.','Beine strecken, oben 1 Sekunde halten.','Langsam ablassen.'],'Bei Knieschmerzen den Bewegungsweg kürzen.','Gewicht fallen lassen.'),
  S('wadenheben_stehend','calf','Wadenheben stehend (Maschine)',['waden'],[],'Wadenmaschine',2,'12–15',['Fußballen auf der Kante, Schultern unter den Polstern.','Unten 2 Sekunden in der Dehnung halten.','Ganz hoch auf die Zehen drücken.'],'Nicht federn. Phase 2: 10–15, Phase 3: 10–12 Wdh.','Kurze, schnelle Wippbewegungen.'),
  S('crunch_maschine','deadbug','Crunch an der Maschine',['bauch'],[],'Bauchmaschine',2,'12–15',['Hinsetzen, Griffe fassen, Füße fixieren.','Brust Richtung Becken einrollen.','Unten kurz halten, langsam zurück.'],'Nicht mit den Armen ziehen. Phase 2/3: 10–12 Wdh.','Zu viel Gewicht und Schwung.'),
  S('koffer_tragen','walk','Koffer-Tragen (Suitcase Carry)',['seitlich'],['unterarme','schultern','ruecken_oben'],'schwere Kurzhantel',2,'30 m pro Seite',['Schwere Kurzhantel in einer Hand.','Aufrecht gehen, ohne zur Seite zu kippen.','Nach 30 m Seite wechseln.'],'Stärkt die seitliche Rumpfmuskulatur, ideal bei Skoliose.','Oberkörper neigt sich zur Hantel.'),
  S('seitheben','pullApart','Seitheben (Kabel oder Kurzhantel)',['schultern'],[],'Kurzhanteln oder Kabelzug',3,'12–15',['Leicht nach vorne gebeugt stehen.','Arme seitlich heben, der Ellbogen führt, bis Schulterhöhe.','Langsam ablassen.'],'Lieber leichter und sauber. Am Kabel einarmig, Kabel kommt von hinter dem Körper.','Schwung aus dem Rücken.'),
  S('reverse_butterfly','pullApart','Reverse Butterfly',['schultern','ruecken_oben'],[],'Butterfly-Maschine',2,'12–15',['Brust ans Polster, Griffe vorne fassen.','Arme breit nach hinten führen, Schultern unten lassen.','Langsam zurück.'],'Für die hintere Schulter und eine gute Haltung.','Schultern zu den Ohren ziehen.'),
  S('sz_curl','curlDb','SZ-Curl (stehend)',['bizeps'],['unterarme'],'SZ-Stange',3,'12–15',['Aufrecht stehen, Stange schulterbreit greifen.','Ellbogen am Körper, Stange zur Schulter beugen.','Ganz runter bis die Arme gestreckt sind.'],'Oberkörper bleibt ruhig. Phase 2: 8–12, Phase 3: 8–10 Wdh.','Schwung aus der Hüfte.'),
  S('trizeps_ueberkopf','press','Trizeps über Kopf am Kabel',['trizeps'],[],'Kabelzug, Seil',3,'12–15',['Seil hinter den Kopf, Ellbogen zeigen nach vorne oben.','Arme über dem Kopf strecken.','Langsam zurück in die tiefe Dehnung.'],'Trifft den langen Trizepskopf am besten. Phase 2: 10–12, Phase 3: 8–10 Wdh.','Ellbogen wandern weit auseinander.'),
  S('schraegbank_curl','curlDb','Schrägbank-Curl Kurzhantel',['bizeps'],[],'Kurzhanteln, Schrägbank (60°)',2,'12–15',['Auf der Schrägbank liegen, Arme hängen hinter dem Körper.','Hanteln zur Schulter beugen, Ellbogen bleiben hinten.','Langsam ganz ablassen.'],'Starke Dehnung im Bizeps. Phase 2/3: 10–12 Wdh.','Ellbogen nach vorne ziehen.'),
  S('schraege_brustpresse','bench','Schräge Brustpresse (Maschine)',['brust'],['schultern','trizeps'],'Maschine',3,'12–15',['Sitz einstellen, Griffe auf Höhe der oberen Brust.','Schräg nach oben vorne drücken.','Langsam zurück bis zur Dehnung.'],'Andere Maschine als am Montag = neuer Reiz. Phase 2: 8–12, Phase 3: 8–10 Wdh.','Rücken löst sich von der Lehne.'),
  S('latzug_eng','latPull','Latzug eng (Untergriff oder V-Griff)',['latissimus'],['bizeps'],'Kabelzug',3,'12–15',['Enger Griff, oben Arme ganz lang.','Ellbogen nah am Körper nach unten ziehen.','Kontrolliert nach oben strecken lassen.'],'Phase 2: 8–12, Phase 3: 8–10 Wdh.','Weit nach hinten lehnen.'),
  S('kabelrudern_einarmig','dbRow','Kabelrudern einarmig (sitzend)',['latissimus','ruecken_oben'],['bizeps'],'Kabelzug',2,'12–15 pro Seite',['Sitzend, Griff in einer Hand, Arm lang.','Ellbogen eng nach hinten ziehen.','Langsam zurück, Oberkörper dreht nicht mit.'],'Schwächere Seite zuerst, gut bei Skoliose.','Mit dem Oberkörper mitdrehen.'),
  S('schulterpresse_maschine','press','Schulterpresse (Maschine)',['schultern'],['trizeps'],'Maschine',2,'12–15',['Rücken fest an der Lehne, Griffe auf Ohrhöhe.','Nach oben drücken.','Oben nicht ganz durchdrücken, langsam zurück.'],'Phase 2: 8–12, Phase 3: 8–10 Wdh.','Hohlkreuz machen.'),
  S('bizeps_kabel','curl','Bizeps-Curl am Kabel',['bizeps'],['unterarme'],'Kabelzug',2,'12–15',['Vor den Kabelzug stellen, Griff unten fassen.','Ellbogen vorne am Körper, Griff zur Schulter beugen.','Unten Arme ganz strecken.'],'Gut als Supersatz mit Trizepsdrücken. Phase 2/3: 10–12 Wdh.','Ellbogen wandern nach hinten.'),
  S('bulgarian','lunge','Bulgarische Split-Kniebeuge',['oberschenkel_vorne','po'],['oberschenkel_hinten'],'Bank, Kurzhanteln',2,'10–12 pro Seite',['Hinterer Fuß auf der Bank, vorderer Fuß weit vorne.','Langsam runter, bis das hintere Knie fast den Boden berührt.','Über die vordere Ferse hochdrücken.'],'Schwächere Seite zuerst. Phase 2/3: 8–10 Wdh.','Vorderes Knie fällt nach innen.'),
  S('beinbeuger_liegend','superman','Beinbeuger liegend',['oberschenkel_hinten'],['waden'],'Maschine',3,'12–15',['Bauchlage, Polster knapp über der Ferse.','Fersen zum Po ziehen, Becken bleibt auf dem Polster.','Langsam ablassen.'],'Andere Variante als sitzend. Phase 2/3: 10–12 Wdh.','Becken hebt vom Polster ab.'),
  S('wadenheben_sitzend','calf','Wadenheben sitzend',['waden'],[],'Maschine',3,'12–15',['Knie unter das Polster, Fußballen auf der Kante.','Unten 2 Sekunden in der Dehnung halten.','Ganz hoch drücken.'],'Trifft den tieferen Wadenmuskel. Phase 3: 10–12 Wdh.','Federn statt kontrolliert.')
);
// Weitere Studio-Übungen, damit es für jeden Muskel genug Auswahl gibt (Muskel antippen, Übung tauschen)
const G = (id, anim, name, m, s, geraet, sets, reps, steps, tip, fehler, ort) => ({id, anim, name, m, s, ort: ort || 'studio', kat:'kraft', geraet, sets, reps, steps, tip, fehler});
EX.push(
  // Brust
  G('kh_bank','bench','Bankdrücken Kurzhantel',['brust'],['trizeps','schultern'],'Kurzhanteln, Flachbank',3,'10–12',['Auf die Flachbank legen, Hanteln über der Brust.','Ellbogen schräg nach unten führen, bis du die Dehnung in der Brust spürst.','Hanteln wieder hochdrücken, oben leicht zueinander.'],'Kurzhanteln lassen die Schultern freier arbeiten als die Stange.','Ellbogen zeigen ganz zur Seite.'),
  G('schraeg_kh','bench','Schrägbankdrücken Kurzhantel',['brust'],['schultern','trizeps'],'Kurzhanteln, Schrägbank (30°)',3,'10–12',['Bank auf 30° stellen, Hanteln auf Höhe der oberen Brust.','Schulterblätter hinten zusammen.','Nach oben drücken, langsam zurück.'],'Trifft die obere Brust.','Bank zu steil, dann arbeiten vor allem die Schultern.'),
  G('kabel_crossover','pullApart','Cable Crossover',['brust'],['schultern'],'Kabelzug (zwei Seiten)',3,'12–15',['Zwischen zwei Kabelzüge stellen, Griffe oben, kleiner Schritt nach vorne.','Arme leicht gebeugt bogenförmig nach unten vorne zusammenführen.','Langsam zurück in die Dehnung.'],'Unten kurz die Brust zusammendrücken.','Mit den Armen drücken statt einen Bogen zu machen.'),
  G('liegestuetz','kneePush','Liegestütz',['brust'],['trizeps','schultern','bauch'],'ohne',3,'8–12',['Hände etwas breiter als schulterbreit, Beine lang.','Körper wie ein Brett, Brust Richtung Boden senken.','Kraftvoll hochdrücken.'],'Zu schwer? Hände auf eine Bank stellen.','Hüfte hängt durch.','beides'),
  // Breiter Rückenmuskel
  G('klimmzug_assist','latPull','Klimmzug mit Unterstützung',['latissimus'],['bizeps','ruecken_oben'],'Klimmzug-Maschine',3,'8–12',['Knie auf das Polster, Griffe schulterbreit fassen.','Brust zur Stange ziehen, Ellbogen Richtung Hüfte.','Langsam ganz nach unten lassen.'],'Mehr Gegengewicht = leichter.','Nur halbe Bewegung.'),
  G('pullover_kabel','latPull','Überzüge am Kabel (gestreckte Arme)',['latissimus'],['bauch'],'Kabelzug, Stange oder Seil',3,'12–15',['Vor den hohen Kabelzug stellen, leicht nach vorne geneigt.','Arme fast gestreckt bogenförmig bis zu den Oberschenkeln ziehen.','Langsam wieder nach oben.'],'Gut zum Spüren des Rückens vor dem Latzug.','Ellbogen stark beugen.'),
  G('lh_rudern','dbRow','Langhantel-Rudern vorgebeugt',['latissimus','ruecken_oben'],['bizeps','unterer_ruecken'],'Langhantel',3,'8–12',['Stange schulterbreit, Oberkörper ca. 45° vorgebeugt, Rücken gerade.','Stange zum Bauchnabel ziehen.','Kontrolliert ablassen.'],'Bauch fest, Rücken bleibt neutral.','Schwung aus dem Oberkörper.'),
  G('tbar_rudern','dbRow','T-Bar-Rudern',['latissimus','ruecken_oben'],['bizeps'],'T-Bar oder Landmine',3,'10–12',['Über die Stange stellen, Griff fassen, Oberkörper vorgebeugt.','Griff zur Brust ziehen, Schulterblätter zusammen.','Langsam ablassen.'],'Mit Brustpolster schont es den unteren Rücken.','Runder Rücken.'),
  // Oberer Rücken
  G('face_pull','pullApart','Face Pull am Kabel',['ruecken_oben','schultern'],[],'Kabelzug, Seil',3,'15',['Seil auf Gesichtshöhe, Daumen zeigen nach hinten.','Seil Richtung Stirn ziehen, Hände gehen auseinander.','Kurz halten, langsam zurück.'],'Super für Haltung und gesunde Schultern.','Zu schwer, dann ziehst du mit dem Rücken.'),
  G('rudern_breit','row','Kabelrudern breit',['ruecken_oben'],['latissimus','schultern'],'Kabelzug, breite Stange',3,'12–15',['Sitzen, breite Stange fassen, Arme lang.','Ellbogen breit nach hinten ziehen, Brust raus.','Langsam nach vorne lassen.'],'Breiter Griff trifft den oberen Rücken.','Weit nach hinten lehnen.'),
  G('reverse_fly_kh','pullApart','Reverse Flys Kurzhantel',['ruecken_oben','schultern'],[],'Kurzhanteln, Schrägbank',3,'12–15',['Bauchlage auf der Schrägbank, Arme hängen.','Arme leicht gebeugt seitlich anheben.','Langsam ablassen.'],'Leichtes Gewicht reicht völlig.','Schultern zu den Ohren.'),
  G('kh_rudern_brust','dbRow','Rudern auf der Schrägbank (Brust gestützt)',['ruecken_oben','latissimus'],['bizeps'],'Kurzhanteln, Schrägbank',3,'10–12',['Bauchlage auf der Schrägbank, Hanteln hängen.','Ellbogen nach hinten oben ziehen.','Langsam ablassen.'],'Entlastet den unteren Rücken komplett.','Kinn nach vorne schieben.'),
  // Unterer Rücken
  G('hyperextension','superman','Rückenstrecker an der 45°-Bank',['unterer_ruecken'],['po','oberschenkel_hinten'],'Hyperextension-Bank',3,'12–15',['Hüfte am Polster, Füße fest.','Oberkörper langsam nach unten rollen.','Bis zur geraden Linie wieder aufrichten.'],'Oben nicht überstrecken.','Ruckartig hochschwingen.'),
  G('rueckenstrecker_maschine','superman','Rückenstrecker-Maschine',['unterer_ruecken'],['po'],'Maschine',3,'12–15',['Hinsetzen, Polster am oberen Rücken.','Oberkörper langsam nach hinten strecken.','Kontrolliert zurück.'],'Leichtes Gewicht, saubere Bewegung.','Zu weit nach hinten ins Hohlkreuz.'),
  G('kh_kreuzheben','rdl','Kreuzheben Kurzhantel',['oberschenkel_hinten','po','unterer_ruecken'],['ruecken_oben'],'Kurzhanteln',3,'10–12',['Hanteln vor den Oberschenkeln, Knie leicht gebeugt.','Hüfte nach hinten schieben, Hanteln am Bein entlang nach unten.','Po anspannen und aufrichten.'],'Gute Einstiegsvariante vor der Langhantel.','Runder Rücken unten.'),
  G('good_morning','rdl','Good Morning (leichte Stange)',['oberschenkel_hinten','unterer_ruecken'],['po'],'Langhantel oder Stab',2,'10–12',['Stange auf dem oberen Rücken, Knie leicht gebeugt.','Hüfte nach hinten, Oberkörper nach vorne bis fast waagerecht.','Mit geradem Rücken aufrichten.'],'Mit leichtem Gewicht oder nur dem Stab anfangen.','Rücken rundet sich.'),
  // Bauch und seitlich
  G('kabel_crunch','deadbug','Kabel-Crunch kniend',['bauch'],[],'Kabelzug, Seil',3,'12–15',['Vor dem hohen Kabelzug knien, Seil neben dem Kopf.','Brust Richtung Knie einrollen.','Langsam wieder aufrichten.'],'Bewegung kommt aus dem Bauch, Hüfte bleibt ruhig.','Mit den Armen ziehen.'),
  G('knieheben','deadbug','Knieheben an der Dip-Station',['bauch'],['seitlich'],'Dip-Station',3,'10–12',['Unterarme auf die Polster, Rücken an die Lehne.','Knie Richtung Brust ziehen, Becken leicht einrollen.','Langsam ablassen.'],'Nicht schwingen.','Beine fallen lassen.'),
  G('ab_rollout','plank','Rollout (Bauchroller oder Kabel)',['bauch'],['schultern','latissimus'],'Bauchroller',3,'8–10',['Auf den Knien, Roller unter den Schultern.','Langsam nach vorne rollen, Bauch fest.','Mit dem Bauch zurückziehen.'],'Nur so weit rollen, wie der Rücken gerade bleibt.','Hohlkreuz.','beides'),
  G('reverse_crunch','deadbug','Reverse Crunch auf der Bank',['bauch'],[],'Flachbank',3,'12',['Rückenlage auf der Bank, hinter dem Kopf festhalten.','Knie Richtung Brust, Becken leicht abheben.','Langsam ablassen.'],'Langsam und ohne Schwung.','Schwung aus den Beinen.'),
  G('pallof_press','pullApart','Pallof Press',['seitlich'],['bauch'],'Kabelzug oder Band',3,'10 pro Seite',['Seitlich zum Kabel stehen, Griff vor der Brust.','Arme gerade nach vorne drücken, Körper dreht nicht mit.','2 Sekunden halten, zurück.'],'Trainiert den Rumpf gegen Verdrehen, sehr rückenfreundlich.','Hüfte dreht mit.','beides'),
  G('holzhacker','openBook','Holzhacker am Kabel',['seitlich'],['bauch','schultern'],'Kabelzug',3,'10 pro Seite',['Seitlich zum hohen Kabel, Griff mit beiden Händen.','Diagonal nach unten zur anderen Hüfte ziehen, Oberkörper dreht mit.','Langsam zurück.'],'Arme bleiben fast gestreckt, die Kraft kommt aus dem Rumpf.','Nur mit den Armen ziehen.'),
  G('russian_twist','openBook','Russian Twist',['seitlich'],['bauch'],'Matte, Gewichtsscheibe',3,'10 pro Seite',['Sitzen, Oberkörper leicht nach hinten, Füße am Boden.','Gewicht abwechselnd zu beiden Seiten führen.','Brust bleibt offen.'],'Füße am Boden ist rückenschonender.','Runder Rücken.','beides'),
  G('seitbeugen_bank','superman','Seitliche Rückenstrecker an der 45°-Bank',['seitlich'],['unterer_ruecken'],'Hyperextension-Bank',2,'10 pro Seite',['Seitlich auf die Bank, Hüfte am Polster.','Oberkörper zur Seite absenken.','Wieder in die gerade Linie heben.'],'Schwächere Seite zuerst.','Oberkörper dreht weg.'),
  // Waden
  G('waden_beinpresse','calf','Wadendrücken an der Beinpresse',['waden'],[],'Beinpresse',3,'15',['Fußballen an die untere Kante der Platte.','Beine fast gestreckt, Platte mit den Zehen wegdrücken.','Langsam zurück in die Dehnung.'],'Unten 1 Sekunde halten.','Knie beugen.'),
  G('waden_einbeinig','calf','Wadenheben einbeinig mit Kurzhantel',['waden'],[],'Kurzhantel, Stufe',3,'12 pro Seite',['Auf einem Bein auf eine Stufe, Hantel in der Hand.','Ganz hoch auf die Zehen.','Langsam unter Stufenhöhe absenken.'],'Mit der freien Hand festhalten.','Wippen.'),
  G('waden_multipresse','calf','Wadenheben an der Multipresse',['waden'],[],'Multipresse, Stufe',3,'12–15',['Stange auf dem oberen Rücken, Fußballen auf der Stufe.','Ganz hoch drücken.','Unten 2 Sekunden Dehnung.'],'Langsam ist besser als schwer.','Federn.'),
  // Schultern
  G('arnold_press','press','Arnold Press',['schultern'],['trizeps'],'Kurzhanteln, Bank',3,'10–12',['Sitzen, Hanteln vor dem Gesicht, Handflächen zu dir.','Beim Hochdrücken die Hände nach außen drehen.','Auf dem Rückweg zurückdrehen.'],'Trifft die Schulter von vorne und seitlich.','Hohlkreuz.'),
  G('ms_schulter','press','Schulterdrücken Multipresse',['schultern'],['trizeps'],'Multipresse, Bank',3,'8–12',['Bank aufrecht, Stange auf Kinnhöhe.','Nach oben drücken.','Kontrolliert bis auf Kinnhöhe zurück.'],'Geführt und sicher.','Stange zu weit hinter den Kopf.'),
  G('frontheben','pullApart','Frontheben Kurzhantel',['schultern'],['brust'],'Kurzhanteln',2,'12',['Aufrecht stehen, Hanteln vor den Oberschenkeln.','Arme gestreckt nach vorne bis Schulterhöhe heben.','Langsam ablassen.'],'Leichtes Gewicht reicht.','Schwung aus dem Rücken.'),
  G('landmine_press','press','Landmine Press',['schultern'],['brust','trizeps'],'Landmine, Langhantel',3,'10 pro Seite',['Stangenende in einer Hand vor der Schulter.','Schräg nach oben vorne drücken.','Langsam zurück.'],'Schulterfreundlich, gut bei Beschwerden über Kopf.','Oberkörper lehnt sich zur Seite.'),
  // Bizeps
  G('hammer_curl','curlDb','Hammer-Curl',['bizeps'],['unterarme'],'Kurzhanteln',3,'10–12',['Hanteln mit Daumen nach oben halten.','Ellbogen am Körper, Hanteln zur Schulter beugen.','Langsam ganz ablassen.'],'Trainiert auch den Unterarm.','Ellbogen wandern nach vorne.'),
  G('konzentrations_curl','curlDb','Konzentrations-Curl',['bizeps'],[],'Kurzhantel, Bank',2,'10–12 pro Seite',['Sitzen, Ellbogen innen am Oberschenkel.','Hantel zur Schulter beugen.','Langsam ganz strecken.'],'Oben kurz anspannen.','Oberkörper hilft mit.'),
  G('scott_curl','curl','Scott-Curl (Maschine oder SZ)',['bizeps'],['unterarme'],'Scottbank oder Maschine',3,'10–12',['Oberarme flach aufs Polster.','Griff zur Schulter beugen.','Langsam fast ganz strecken.'],'Kein Schummeln möglich, sehr gezielt.','Unten ruckartig fallen lassen.'),
  // Trizeps
  G('trizeps_seil','pushdown','Trizepsdrücken mit Seil',['trizeps'],[],'Kabelzug, Seil',3,'12–15',['Seil oben fassen, Ellbogen am Körper.','Nach unten strecken, Seil unten auseinanderziehen.','Langsam zurück.'],'Ellbogen bleiben fest an der Seite.','Ellbogen gehen mit nach vorne.'),
  G('french_press','bench','French Press (SZ-Stange)',['trizeps'],[],'SZ-Stange, Flachbank',3,'10–12',['Rückenlage, Stange über der Brust.','Nur die Unterarme beugen, Stange Richtung Stirn.','Wieder strecken.'],'Oberarme bleiben still.','Ellbogen gehen weit auseinander.'),
  G('kickback','dbRow','Trizeps-Kickback',['trizeps'],[],'Kurzhantel, Bank',2,'12 pro Seite',['Hand und Knie auf der Bank, Oberarm am Körper.','Unterarm nach hinten strecken.','Langsam zurück.'],'Oben kurz halten.','Schwung.'),
  G('dips_assist','pushdown','Dips mit Unterstützung',['trizeps'],['brust','schultern'],'Dip-Maschine',3,'8–12',['Knie oder Füße aufs Polster, Hände auf die Griffe.','Ellbogen nach hinten beugen, bis die Oberarme etwa waagerecht sind.','Hochdrücken.'],'Oberkörper aufrecht = mehr Trizeps.','Zu tief bei Schulterbeschwerden.'),
  G('enges_bank','bench','Enges Bankdrücken',['trizeps'],['brust','schultern'],'Langhantel oder Multipresse',3,'8–10',['Hände schulterbreit an der Stange.','Ellbogen eng am Körper zur unteren Brust senken.','Hochdrücken.'],'Schulterbreit reicht, nicht enger.','Ellbogen gehen zur Seite.'),
  // Beine und Po
  G('hackenschmidt','squat','Hackenschmidt-Kniebeuge',['oberschenkel_vorne'],['po'],'Hackenschmidt-Maschine',3,'10–12',['Rücken an das Polster, Füße schulterbreit auf der Platte.','Langsam tief in die Knie.','Aus der ganzen Fußsohle hochdrücken.'],'Geführt und rückenschonend.','Fersen heben ab.'),
  G('ausfallschritt_kh','lunge','Ausfallschritte gehend mit Kurzhanteln',['oberschenkel_vorne','po'],['oberschenkel_hinten'],'Kurzhanteln',3,'10 pro Seite',['Hanteln seitlich, großer Schritt nach vorne.','Hinteres Knie Richtung Boden.','Aus dem vorderen Bein in den nächsten Schritt.'],'Oberkörper bleibt aufrecht.','Vorderes Knie knickt nach innen.'),
  G('pull_through','rdl','Pull-Through am Kabel',['po','oberschenkel_hinten'],['unterer_ruecken'],'Kabelzug, Seil',3,'12–15',['Rücken zum tiefen Kabel, Seil zwischen den Beinen.','Hüfte nach hinten schieben.','Po anspannen und die Hüfte nach vorne strecken.'],'Leicht zu lernen, schont den Rücken.','Mit den Armen ziehen.'),
  G('abduktoren','sideWalk','Abduktoren-Maschine',['po'],[],'Maschine',3,'15',['Hinsetzen, Polster außen an den Knien.','Beine nach außen drücken.','Langsam zurück.'],'Oberkörper leicht nach vorne trifft den Po besser.','Gewicht zurückknallen lassen.'),
  G('kickback_kabel','birddog','Po-Kickback am Kabel',['po'],['oberschenkel_hinten'],'Kabelzug, Fußschlaufe',3,'12 pro Seite',['Schlaufe am Fuß, vor dem tiefen Kabel festhalten.','Bein gestreckt nach hinten führen.','Langsam zurück.'],'Nicht ins Hohlkreuz gehen.','Oberkörper kippt nach vorne.'),
  G('beinbeuger_stehend','superman','Beinbeuger stehend einbeinig',['oberschenkel_hinten'],['waden'],'Maschine oder Kabel',3,'12 pro Seite',['Polster an der Ferse, festhalten.','Ferse zum Po ziehen.','Langsam ablassen.'],'Hüfte bleibt ruhig.','Becken kippt.')
);

const EXMAP = Object.fromEntries(EX.map(e => [e.id, e]));
// Programme mit eigenem Titelbild (3D-Avatar, KI-erzeugt) → img/prog/<id>.jpg
const COVERS = ['ruecken', 'rumpf', 'unterer_ruecken', 'mobility', 'gk_mobility', 'gk_home', 'beine', 'haltung', 'oberkoerper', 'kreislauf', 'balance', 'studio_gk', 'studio_ok', 'studio_beine'];
// Übungen mit echten Fotos (Start- und Endposition), pro Figur: m = Mann, w = Frau → img/ex/<id>_<m|w>_1.jpg und _2.jpg
const PHOTOS = {kniebeuge: ['m', 'a'], kniebeuge_stuhl: ['m', 'a'], ausfallschritt: ['m', 'a'], bruecke: ['a'], liegestuetz_knie: ['a'], wandliegestuetz: ['a'], band_bizeps: ['a'], band_pullapart: ['a'], band_rudern: ['a'], band_seitgehen: ['a'], brustoeffner: ['a'], deadbug: ['a'], einbeinstand: ['a'], hueftbeuger: ['a'], katzekuh: ['a'], offenesbuch: ['a'], plank: ['a'], seitstuetz: ['a'], stepup: ['a'], superman: ['a'], treppen: ['a'], vierfuessler: ['a'], wadenheben: ['a'], wandsitzen: ['a']};

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
  // 5-Tage-Split (Vorlagen nur für den Coach)
  {id:'split_a', ort:'studio', nurCoach:true, name:'Split Tag A · Brust + Rücken', min:65, info:'5-Tage-Split, Montag', items:[['schraegbank_multi',3,'12–15'],['latzug',3,'12–15'],['brustpresse',3,'12–15'],['rudermaschine_eng',3,'12–15'],['butterfly',2,'12–15'],['low_row',2,'12–15']]},
  {id:'split_b', ort:'studio', nurCoach:true, name:'Split Tag B · Beine + Rumpf', min:75, info:'5-Tage-Split, Dienstag', items:[['kniebeuge_lh',3,'12–15'],['kreuzheben_lh',3,'10–12'],['hip_thrust',3,'12–15'],['beinbeuger_sitzend',3,'12–15'],['beinstrecker',2,'12–15'],['wadenheben_stehend',2,'12–15'],['crunch_maschine',2,'12–15'],['koffer_tragen',2,'30 m pro Seite']]},
  {id:'split_c', ort:'studio', nurCoach:true, name:'Split Tag C · Schultern + Arme', min:60, info:'5-Tage-Split, Mittwoch', items:[['kh_schulter',3,'12–15'],['seitheben',3,'12–15'],['reverse_butterfly',2,'12–15'],['sz_curl',3,'12–15'],['trizeps_ueberkopf',3,'12–15'],['schraegbank_curl',2,'12–15'],['crunch_maschine',2,'12–15']]},
  {id:'split_d', ort:'studio', nurCoach:true, name:'Split Tag D · Oberkörper kompakt', min:55, info:'5-Tage-Split, Freitag', items:[['schraege_brustpresse',3,'12–15'],['latzug_eng',3,'12–15'],['kabelrudern_einarmig',2,'12–15 pro Seite'],['schulterpresse_maschine',2,'12–15'],['seitheben',3,'12–15'],['bizeps_kabel',2,'12–15'],['trizeps_kabel',2,'12–15']]},
  {id:'split_e', ort:'studio', nurCoach:true, name:'Split Tag E · Unterkörper kompakt', min:55, info:'5-Tage-Split, Samstag', items:[['beinpresse',3,'12–15'],['rdl',3,'12–15'],['bulgarian',2,'10–12 pro Seite'],['beinbeuger_liegend',3,'12–15'],['wadenheben_sitzend',3,'12–15'],['seitstuetz',2,'30–45 s pro Seite']]},
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
