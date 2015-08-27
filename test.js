var require('mongoose');


var users = [{
  userId : 'id2',
  username : 'me',
},{
  userId : 'ip2',
  username : 'you',
}];


// MongoClient.connect('mongodb://localhost:27017/auth-service-test', function(err, db) {
//     expect(err).to.not.exist;
//     console.log("connected!");
    db.collection('users').insert(users, function(err, docs) {
      console.log('inserted');
      expect(err).to.not.exist;
      expect(docs.length).to.be.equal(users.length);
      done();
    });
// });
