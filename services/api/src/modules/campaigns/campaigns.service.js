import * as repository from './campaigns.repository.js';
import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from '../../errors/AppError.js';

// §7.3: role check in the router, ownership check here — always both.
async function getOwnedCampaign(campaignId, merchantId) {
  const campaign = await repository.findById(campaignId);
  if (!campaign) throw new NotFoundError('Campaign not found');
  if (campaign.merchant_id !== merchantId) {
    throw new ForbiddenError('This campaign is not yours');
  }
  return campaign;
}

export async function createCampaign(merchantId, input) {
  return repository.insert({ merchantId, ...input });
}

export async function listMine(merchantId, { limit, offset }) {
  return repository.listByMerchantId(merchantId, { limit, offset });
}

export async function getCampaign(campaignId, merchantId) {
  return getOwnedCampaign(campaignId, merchantId);
}

export async function listCreators(campaignId, merchantId) {
  const campaign = await getOwnedCampaign(campaignId, merchantId);
  return repository.listCreatorsForCampaign(campaign.id);
}

export async function addCreator(campaignId, merchantId, { creatorId, agreedAmount }) {
  const campaign = await getOwnedCampaign(campaignId, merchantId);

  const creator = await repository.findCreatorById(creatorId);
  if (!creator) throw new NotFoundError('Creator not found');
  if (creator.status !== 'approved') {
    throw new ValidationError('Creator is not approved for the program');
  }
  if (await repository.findCampaignCreator(campaign.id, creatorId)) {
    throw new ConflictError('Creator is already part of this campaign');
  }

  return repository.insertCampaignCreator({ campaignId: campaign.id, creatorId, agreedAmount });
}

export async function getMetrics(campaignId, merchantId) {
  const campaign = await getOwnedCampaign(campaignId, merchantId);
  return repository.listMetricsForCampaign(campaign.id);
}
