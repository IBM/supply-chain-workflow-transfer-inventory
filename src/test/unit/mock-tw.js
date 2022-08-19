/* (C) Copyright 2022 IBM Corporation.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
*/

const mockData = {
  mockQueryOutput: {
    'data': {
      'inventory': {
        'edges': [{
          'object': {
            'location': {
              'locationName': 'mockLocationName'
            },
            'product': {
              'partNumber': 'mockPartNumber',
              'description': 'mockDesc'
            },
            'quantityAboveUpperThreshold': 'mockQuantity'
          }
        }]
      }
    }
  },
  mockGQL: {
    'query': 'mockQuery',
    'variables': {}
  }
};
const local = {
  requestForm: {
    quantityRequested: '',
    nodeManagerInfo: {
      name: '',
      email: ''
    },
    requestedDateForResponse: new Date(),
    requestedDateForTransfer: new Date(),
    requestorInfo: {
      name: ''
    },
    transferFromLocation: '',
    requestingLocation: 'mockRequestingLocation',
    productId: '',
    productDescription: '',
    quantityAvailable: ''
  },
  queryInventoryGQLOutput: JSON.stringify(mockData.mockQueryOutput),
  queryLocationAndPartNumberGQLOutput: JSON.stringify(mockData.mockQueryOutput),
  getLocationAndPartNumberByInventoryIdGQL: JSON.stringify(mockData.mockGQL),
  getInventoryByPartNumberGQL: JSON.stringify(mockData.mockGQL),
  queryLocationAndPartNumberGQL: '',
  queryInventoryGQL: '',
  logs: {
    listLength: 0
  },
  workItem: {
    businessObject: {
      actionTaken: [],
      sourceId: 'mockSourceId',
      updateReceived: '',
      endDate: 'mockEndDate',
      actionDefinition: {
        id: 'mockActionDefId'
      },
      priority: 2,
      businessObject: {
        id: 'mockBusinessObjId',
        type: 'Inventory'
      },
      createReceived: '',
      sourceType: 'WorkQueueDefinition',
      userAssigned: 'mockUser',
      additionalInfo: {},
      tenantId: 'mockTenantId',
      id: 'mockWorkItemId',
      globalIdentifiers: [],
      status:''
    },
    action: ''
  },
  workItemBody:'',
  actionTakenBody: '',
  workItemOutput:'{ \"id\": \"mockNewWorkItemId\" }',
  tenantId: 'mockTenantId',
  inventoryId: 'mockInventoryId',
  didUpdateWorkItem: null,
  didUpdateActionTaken: null,
  currentStatus: 'mockStatus'
};

const object = {
  listOf : {
    toolkit:{
      TWSYS: {
        String: class String {
          static String() {}
        }
      }
    }
  }
};

const system = {
  user: {
    name: 'mockUserName'
  },
  currentProcessInstance: {
    id: 'mockCurrentProcess'
  }
};

module.exports = {
  local,
  system,
  object
};
