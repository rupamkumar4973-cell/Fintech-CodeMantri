const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

let isMock = false;
const mockDbFilePath = path.join(__dirname, '../data/mock_db.json');
let mockDb = {};

// Load mock DB
function loadMockDb() {
  if (!fs.existsSync(path.dirname(mockDbFilePath))) {
    fs.mkdirSync(path.dirname(mockDbFilePath), { recursive: true });
  }
  if (fs.existsSync(mockDbFilePath)) {
    try {
      mockDb = JSON.parse(fs.readFileSync(mockDbFilePath, 'utf8'));
    } catch (err) {
      console.error('Error reading mock DB file, initializing empty:', err.message);
      mockDb = {};
    }
  }
}

function saveMockDb() {
  try {
    fs.writeFileSync(mockDbFilePath, JSON.stringify(mockDb, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving mock DB file:', err.message);
  }
}

class MockQuery {
  constructor(data, isSingle = false) {
    this.data = data;
    this.isSingle = isSingle;
  }
  sort(options) {
    if (typeof options === 'object') {
      const key = Object.keys(options)[0];
      const dir = options[key];
      this.data.sort((a, b) => {
        if (a[key] < b[key]) return dir === -1 || dir === 'desc' ? 1 : -1;
        if (a[key] > b[key]) return dir === -1 || dir === 'desc' ? -1 : 1;
        return 0;
      });
    } else if (typeof options === 'string') {
      const desc = options.startsWith('-');
      const key = desc ? options.substring(1) : options;
      this.data.sort((a, b) => {
        if (a[key] < b[key]) return desc ? 1 : -1;
        if (a[key] > b[key]) return desc ? -1 : 1;
        return 0;
      });
    }
    return this;
  }
  select(fields) {
    return this;
  }
  limit(n) {
    this.data = this.data.slice(0, n);
    return this;
  }
  populate(fields) {
    if (fields === 'userId' || fields === 'user') {
      const targetField = fields;
      this.data = this.data.map(item => {
        if (item[targetField] && typeof item[targetField] === 'string') {
          const user = mockDb['User']?.find(u => u._id === item[targetField]);
          if (user) {
            const { password, ...userWithoutPassword } = user;
            return { ...item, [targetField]: userWithoutPassword };
          }
        }
        return item;
      });
    }
    return this;
  }
  exec() {
    const resolvedValue = this.isSingle ? (this.data[0] || null) : this.data;
    return Promise.resolve(resolvedValue);
  }
  then(onSuccess, onFailure) {
    const resolvedValue = this.isSingle ? (this.data[0] || null) : this.data;
    return Promise.resolve(resolvedValue).then(onSuccess, onFailure);
  }
}

class MockModel {
  constructor(name, schema) {
    this.name = name;
    this.schema = schema;
    if (!mockDb[name]) {
      mockDb[name] = [];
    }
  }

  find(query = {}) {
    loadMockDb();
    let results = mockDb[this.name] || [];
    
    // Filter matching
    results = results.filter(item => {
      for (let key in query) {
        if (query[key] !== undefined) {
          // If query key is an object (e.g. $in, $gte, etc.)
          if (typeof query[key] === 'object' && query[key] !== null) {
            const operators = query[key];
            if ('$in' in operators && Array.isArray(operators.$in)) {
              if (!operators.$in.includes(item[key])) return false;
            }
            if ('$gte' in operators) {
              if (item[key] < operators.$gte) return false;
            }
            if ('$lte' in operators) {
              if (item[key] > operators.$lte) return false;
            }
            if ('$gt' in operators) {
              if (item[key] <= operators.$gt) return false;
            }
            if ('$lt' in operators) {
              if (item[key] >= operators.$lt) return false;
            }
          } else {
            // direct match
            if (item[key] !== query[key]) return false;
          }
        }
      }
      return true;
    });

    // Deep copy results
    const resultsCopy = JSON.parse(JSON.stringify(results));
    
    // Add instance save method to each element
    const modelName = this.name;
    const items = resultsCopy.map(item => {
      return {
        ...item,
        save: async function() {
          loadMockDb();
          const idx = mockDb[modelName].findIndex(x => x._id === this._id);
          this.updatedAt = new Date().toISOString();
          if (idx !== -1) {
            mockDb[modelName][idx] = { ...this };
          } else {
            mockDb[modelName].push({ ...this });
          }
          saveMockDb();
          return this;
        }
      };
    });

    return new MockQuery(items, false);
  }

  findOne(query = {}) {
    const queryResult = this.find(query);
    return new MockQuery(queryResult.data, true);
  }

  async findById(id) {
    return this.findOne({ _id: id });
  }

  async create(data) {
    loadMockDb();
    const records = Array.isArray(data) ? data : [data];
    const created = [];
    
    for (let r of records) {
      const newRecord = {
        _id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...r
      };
      
      const modelName = this.name;
      const instance = {
        ...newRecord,
        save: async function() {
          loadMockDb();
          const idx = mockDb[modelName].findIndex(item => item._id === this._id);
          this.updatedAt = new Date().toISOString();
          if (idx !== -1) {
            mockDb[modelName][idx] = { ...this };
          } else {
            mockDb[modelName].push({ ...this });
          }
          saveMockDb();
          return this;
        }
      };
      
      if (!mockDb[this.name]) {
        mockDb[this.name] = [];
      }
      mockDb[this.name].push(newRecord);
      created.push(instance);
    }
    
    saveMockDb();
    return Array.isArray(data) ? created : created[0];
  }

  async findByIdAndUpdate(id, update, options = { new: true }) {
    loadMockDb();
    const idx = mockDb[this.name]?.findIndex(item => item._id === id);
    if (idx === undefined || idx === -1) return null;
    
    const current = mockDb[this.name][idx];
    
    // Resolve updates (handles $set or flat update)
    let updateFields = update;
    if (update.$set) {
      updateFields = { ...updateFields, ...update.$set };
      delete updateFields.$set;
    }
    if (update.$push) {
      // support basic pushing for notifications/logs
      for (let k in update.$push) {
        if (!current[k]) current[k] = [];
        current[k].push(update.$push[k]);
      }
      delete updateFields.$push;
    }
    
    const updated = {
      ...current,
      ...updateFields,
      updatedAt: new Date().toISOString()
    };
    
    mockDb[this.name][idx] = updated;
    saveMockDb();
    
    // Add save method to updated instance
    const modelName = this.name;
    const instance = {
      ...updated,
      save: async function() {
        loadMockDb();
        const index = mockDb[modelName].findIndex(item => item._id === this._id);
        this.updatedAt = new Date().toISOString();
        if (index !== -1) {
          mockDb[modelName][index] = { ...this };
        } else {
          mockDb[modelName].push({ ...this });
        }
        saveMockDb();
        return this;
      }
    };
    
    return instance;
  }

  async findOneAndUpdate(query, update, options = { new: true }) {
    const record = await this.findOne(query);
    if (!record) return null;
    return this.findByIdAndUpdate(record._id, update, options);
  }

  async countDocuments(query = {}) {
    const queryResult = await this.find(query);
    return queryResult.length;
  }

  async deleteOne(query = {}) {
    loadMockDb();
    const idx = mockDb[this.name]?.findIndex(item => {
      for (let key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
    
    if (idx !== undefined && idx !== -1) {
      mockDb[this.name].splice(idx, 1);
      saveMockDb();
      return { deletedCount: 1 };
    }
    return { deletedCount: 0 };
  }

  async findByIdAndDelete(id) {
    return this.deleteOne({ _id: id });
  }
}

// DB connection function
const connectDB = async () => {
  if (process.env.FORCE_MOCK_DB === 'true') {
    console.log('⚠️ FORCE_MOCK_DB is set to true. Bypassing MongoDB connection.');
    isMock = true;
    loadMockDb();
    console.log('✅ Local Mock JSON database initialized at:', mockDbFilePath);
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smartloan', {
      serverSelectionTimeoutMS: 3000 // 3 seconds timeout
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    isMock = false;
  } catch (error) {
    console.log('❌ MongoDB Connection Error:', error.message);
    console.log('⚠️ Falling back to local Mock JSON database...');
    isMock = true;
    loadMockDb();
    console.log('✅ Local Mock JSON database initialized at:', mockDbFilePath);
  }
};

// Define model getter
const getModel = (modelName, schema) => {
  let mongooseModel;
  try {
    if (mongoose.models[modelName]) {
      mongooseModel = mongoose.models[modelName];
    } else {
      mongooseModel = mongoose.model(modelName, schema);
    }
  } catch (err) {
    console.error(`Error pre-compiling mongoose model for ${modelName}:`, err.message);
  }

  const mockModelInstance = new MockModel(modelName, schema);

  return new Proxy({}, {
    get(target, prop) {
      const activeModel = isMock ? mockModelInstance : mongooseModel;
      if (activeModel && typeof activeModel[prop] === 'function') {
        return activeModel[prop].bind(activeModel);
      }
      return activeModel ? activeModel[prop] : undefined;
    },
    construct(target, args) {
      const activeModel = isMock ? mockModelInstance : mongooseModel;
      if (isMock) {
        const data = args[0] || {};
        return {
          _id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...data,
          save: async function() {
            loadMockDb();
            if (!mockDb[modelName]) {
              mockDb[modelName] = [];
            }
            const idx = mockDb[modelName].findIndex(x => x._id === this._id);
            this.updatedAt = new Date().toISOString();
            if (idx !== -1) {
              mockDb[modelName][idx] = { ...this };
            } else {
              mockDb[modelName].push({ ...this });
            }
            saveMockDb();
            return this;
          }
        };
      } else {
        return Reflect.construct(activeModel, args);
      }
    }
  });
};


module.exports = {
  connectDB,
  getModel,
  isMock: () => isMock,
  Schema: mongoose.Schema
};
