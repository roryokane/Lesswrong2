import Users from 'meteor/vulcan:users';
import EditorFormComponent from '../../editor/EditorFormComponent.jsx';
const schema = {

  // default properties

  _id: {
    type: String,
    optional: false,
    viewableBy: ['guests'],
  },

  createdAt: {
    type: Date,
    optional: true,
    viewableBy: ['guests'],
    editableBy: ['admins'],
    insertableBy: ['admins'],
    onInsert: () => {
      return new Date();
    },
  },

  userId: {
    type: String,
    optional: true,
    viewableBy: ['guests'],
    resolveAs: {
      fieldName: 'user',
      type: 'User',
      resolver: (sequence, args, context) => {
        return context.Users.findOne({ _id: sequence.userId }, { fields: context.Users.getViewableFields(context.currentUser, context.Users)})
      },
      addOriginalField: true,
    }
  },

  // Custom Properties

  title: {
    type: String,
    optional: false,
    viewableBy: ['guests'],
    editableBy: ['admins'],
    insertableBy: ['admins'],
  },

  description: {
    type: Object,
    optional: true,
    viewableBy: ['guests'],
    editableBy: ['admins'],
    insertableBy: ['admins'],
    control: EditorFormComponent,
  },

  /*
    Dummy field that resolves to the array of books that belong to a sequence
  */

  booksDummy: {
    type: Array,
    optional: true,
    viewableBy: ['guests'],
    resolveAs: {
      fieldName: 'books',
      type: '[Book]',
      resolver: (sequence, args, context) => {
        const books = context.Books.find({collectionId: sequence._id}, {fields: context.Users.getViewableFields(context.currentUser, context.Books)}).fetch();
        console.log("booksDummy resolver: ", books);
        return books;
      }
    }
  },

  'booksDummy.$': {
    type: String,
    optional: true,
  },

  gridImageId: {
    type: String,
    optional: true,
    viewableBy: ["guests"],
    editableBy: ['admins'],
    insertableBy: ['admins'],
  },

}


export default schema;
