const { Contact } = require("../schemas/contactSchema");

const getAllContacts = async (userId, { skip, limit }) =>
  await Contact.find({ owner: userId }).skip(skip).limit(limit);

const getContactById = async ({ contactId }, { _id }) =>
  await Contact.findOne({ _id: contactId, owner: _id });

const createContact = async ({ name, email, phone, favorite }, { _id }) =>
  await Contact.create({ name, email, phone, favorite, owner: _id });

const updateContact = async ({ contactId }, fields, { _id }) =>
  await Contact.findOneAndUpdate({ _id: contactId, owner: _id }, fields, {
    new: true,
  });

const removeContact = async ({ contactId }, { _id }) =>
  await Contact.findOneAndRemove({ _id: contactId, owner: _id });

const updateStatusContact = async ({ contactId }, fields, { _id }) =>
  await Contact.findOneAndUpdate({ _id: contactId, owner: _id }, fields, {
    new: true,
  });

const getContactsByFavorite = async ({ _id }, { favorite }) =>
  await Contact.find({ owner: _id, favorite });

module.exports = {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  removeContact,
  updateStatusContact,
  getContactsByFavorite,
};
