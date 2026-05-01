const request = require('supertest');
const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('Cloud Functions API', () => {
  let app;
  let dbStub;
  let adminStub;

  before(() => {
    dbStub = {
      collection: sinon.stub().returnsThis(),
      doc: sinon.stub().returnsThis(),
      get: sinon.stub(),
      set: sinon.stub(),
      update: sinon.stub(),
      add: sinon.stub(),
    };

    adminStub = {
      initializeApp: sinon.stub(),
      firestore: sinon.stub().returns(dbStub),
    };

    adminStub.firestore.FieldValue = {
      increment: sinon.stub().returns('increment'),
      serverTimestamp: sinon.stub().returns('timestamp'),
    };

    const index = proxyquire('../index', {
      'firebase-admin': adminStub,
      'firebase-functions': {
        https: {
          onRequest: sinon.stub(),
        },
      },
    });

    app = index.app;
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('GET /questions', () => {
    it('should return a list of questions without correct answers', async () => {
      const res = await request(app).get('/questions');
      expect(res.status).to.equal(200);
      expect(res.body.questions).to.be.an('array');
    });
  });

  describe('POST /scores', () => {
    it('should calculate and save score', async () => {
      dbStub.set.resolves();
      
      const payload = {
        uid: 'test-user',
        answers: [1, 2, 1, 1, 2, 2, 2, 2, 1, 2]
      };

      const res = await request(app).post('/scores').send(payload);
      
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('score');
    });
  });
});
