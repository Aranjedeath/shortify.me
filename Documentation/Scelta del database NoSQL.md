#Scelta del database NoSQL
Il caso di studio prevede la realizzazione di un url shortener. Questo particolare sistema permette di ridurre la grandezza di un url e di distrubuirla a terzi per usufruirne. Il servizio reindirizzerà a l’url principale. Ciò che si dovrebbe fornire oltre alla riduzione dell’url, sono delle statistiche sugli accessi che vengono fatti in finestre temporali.
Questo prevede scritture che sono:


- Creazione nuovo short url;
- Aggiornamento dei dati per l’analisi statistica ogni volta che si utilizza uno short url;

e delle letture che sono:


- Creazione nuovo short url;
- Lettura del long url;
- Lettura dei dati per l’analisi statistica.

Il caso della Creazione del nuovo short url richiede sia una lettura che una scrittura perchè bisogna verificare prima se esiste già e poi scriverlo.

Per il caso di studio sarà necessario avere **un** **servizio** **sempre** **fruibile** da parte dell’utente e che permetta di accedere sempre ai dati. In oltre deve essere in grado di **gestire** adeguatamente **l’**overload**** del sistema o essere adeguato a un grande flusso di dati già nativamente.

Le considerazioni verranno fatte sul **CAP THEOREM** che prevede una classificazione rispetto alle 3 importanti **caratteristiche** di un database nosql : **consistenza**, **disponibilità** e **tolleranza** **per la partizione**. <br>Per definizione non è possibile avere un database che abbia tutte e 3 le caratteristiche ma al più 2. Per le considerazioni fatte in precedenza **le** **caratteristiche** **scelte** **sono** la **disponibilità** che garantisce un servizio sempre utilizzabile **e** la ****tolleranza** della partizione** che permette di utilizzare sempre il servizio anche se la partizione non comunica con le altre. <br><pre>--->InsertHereTheMissingText<---</pre>

##Cassandra
La scelta di **cassandra** è una scelta solida grazie alla definizione **AP** dello stesso (Cap Theorem). La struttura di cassandra è formata da un anello (ring) di nodi che rappresentano ognuno una partizione diversa dello spazio. Ogni dato viene attribuito a un singolo nodo che viene replicato successivamente in altri nodi. E’ possibile creare anche dei nodi virtuali che permettono di distribuire meglio lo spazio dell’anello sui vari nodi. Cassandra ha come caratteristica principale il non avere un singolo Point-Of-Failure e avere quindi una ottima gestione in caso di node failure. La disponibilità fa in modo di avere sempre accesso al cluster nonostante un nodo fallisca. La **tolleranza della partizione** fa in modo di poter utilizzare i nodi anche se non possono comunicare tra di loro.<br>
Nel nostro specifico caso questo garantisce al cliente un servizio sempre fruibile e con rapidità. Rispetto ad altri database NoSQL la **scalabilità** di cassandra è **ottima** al crescere dei nodi.

<pre>
Immagine:
<a target="_blank" href="https://github.com/GruppoPBDMNG-7/shortify.me/blob/master/Documentation/images/scalabilit%C3%A0.png">Scalabilità</a>
</pre>
Le nostre analisi statistiche possono essere fatte grazie all’uso dei contatori in cassandra che analizzeremo in dettaglio.

###Uso contatori
Un difficoltà nell’uso dei contatori risiede nel sincronizzarli tra loro. Se arrivano due incrementi di un contatore c su due nodi, contemporaneamente, il vector clock non permette di decidere come agire. (c’è un errore nell’immagini l’incremento è per uno)
<pre>
Immagini:
<a target="_blank" href="https://github.com/GruppoPBDMNG-7/shortify.me/blob/master/Documentation/images/count1.png">Contatori#1</a>
<a target="_blank" href="https://github.com/GruppoPBDMNG-7/shortify.me/blob/master/Documentation/images/count2.png">Contatori#2</a>
</pre>
Questa situazione spiacevole è risolta da Cassandra 2.0 partizionando il contatore c in più parti attribuibile ciascuna ad un nodo singolo.
Quindi le varie parti vengono sincronizzate singolarmente, senza doverlo fare su tutte le parti del contatore contemporaneamente.
<pre>
Immagini:
<a target="_blank" href="https://github.com/GruppoPBDMNG-7/shortify.me/blob/master/Documentation/images/count3.png">Contatori#3</a>
<a target="_blank" href="https://github.com/GruppoPBDMNG-7/shortify.me/blob/master/Documentation/images/count4.png">Contatori#4</a>
</pre>
Fonte: [Distributed Counters in Cassandra
](http://www.datastax.com/wp-content/uploads/2011/07/cassandra_sf_counters.pdf)