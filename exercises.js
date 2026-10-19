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
const EXMAP = Object.fromEntries(EX.map(e => [e.id, e]));
// Programme mit eigenem Titelbild (3D-Avatar, KI-erzeugt) → img/prog/<id>.jpg
const COVERS = ['ruecken', 'rumpf', 'unterer_ruecken', 'mobility', 'gk_mobility', 'gk_home'];
// Übungen mit echten Fotos (Start- und Endposition), pro Figur: m = Mann, w = Frau → img/ex/<id>_<m|w>_1.jpg und _2.jpg
const PHOTOS = {kniebeuge: ['m'], kniebeuge_stuhl: ['m'], ausfallschritt: ['m']};

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
