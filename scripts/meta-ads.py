import os
import sys
import requests
from dotenv import dotenv_values

# Load credentials
env = dotenv_values(os.path.join(os.path.dirname(__file__), '..', '.env'))
TOKEN = env.get('META_ACCESS_TOKEN')
BASE_URL = 'https://graph.facebook.com/v19.0'

# Args: date preset, optional account filter
# Usage:
#   python scripts/meta-ads.py today
#   python scripts/meta-ads.py last_7d
#   python scripts/meta-ads.py today "A&H"        <- single account by name
DATE_PRESET = sys.argv[1] if len(sys.argv) > 1 else 'last_7d'
ACCOUNT_FILTER = sys.argv[2].upper() if len(sys.argv) > 2 else None
DATE_LABEL = DATE_PRESET.replace('_', ' ').replace('last ', 'Last ')

def get(endpoint, params={}):
    p = dict(params)
    p['access_token'] = TOKEN
    r = requests.get(f"{BASE_URL}/{endpoint}", params=p)
    return r.json()

def find_action(actions, *types):
    for t in types:
        val = next((a['value'] for a in actions if a['action_type'] == t), None)
        if val:
            return val
    return '0'

def find_cost(costs, *types):
    for t in types:
        val = next((a['value'] for a in costs if a['action_type'] == t), None)
        if val:
            return f"${float(val):,.2f}"
    return 'N/A'

def get_active_accounts():
    data = get('me/adaccounts', {
        'fields': 'id,name,currency,account_status',
        'limit': 50
    })
    accounts = []
    for a in data.get('data', []):
        if a['account_status'] == 1:  # 1 = active
            if ACCOUNT_FILTER and ACCOUNT_FILTER not in a['name'].upper():
                continue
            accounts.append(a)
    return accounts

def account_overview(account_id, currency):
    data = get(f"{account_id}/insights", {
        'date_preset': DATE_PRESET,
        'fields': 'spend,impressions,reach,clicks,ctr,cpc,actions,cost_per_action_type',
        'level': 'account'
    })
    sym = 'PHP' if currency == 'PHP' else 'USD'
    if 'data' in data and data['data']:
        d = data['data'][0]
        actions = d.get('actions', [])
        costs = d.get('cost_per_action_type', [])
        spend      = float(d.get('spend', 0))
        clicks     = int(d.get('clicks', 0))
        lpv        = find_action(actions, 'landing_page_view')
        purchases  = find_action(actions, 'purchase', 'omni_purchase')
        leads      = find_action(actions, 'lead')
        cost_lpv   = find_cost(costs, 'landing_page_view')
        cost_pur   = find_cost(costs, 'purchase', 'omni_purchase')
        cost_lead  = find_cost(costs, 'lead')
        lpv_rate   = (int(lpv) / clicks * 100) if clicks > 0 else 0

        print(f"  Spend:            {sym} {spend:,.2f}")
        print(f"  Reach:            {int(d.get('reach', 0)):,}")
        print(f"  Clicks:           {clicks:,} | CTR: {float(d.get('ctr', 0)):.2f}% | CPC: ${float(d.get('cpc', 0)):,.2f}")
        print(f"  LP Views:         {lpv} ({lpv_rate:.1f}% of clicks) | Cost/LPV: {cost_lpv}")
        print(f"  Purchases:        {purchases} | Cost/Purchase: {cost_pur}")
        print(f"  Leads:            {leads} | Cost/Lead: {cost_lead}")
    elif 'error' in data:
        print(f"  Error: {data['error'].get('message', 'Unknown error')}")
    else:
        print("  No data for this period.")

def campaign_breakdown(account_id, currency):
    data = get(f"{account_id}/insights", {
        'date_preset': DATE_PRESET,
        'fields': 'campaign_name,spend,clicks,ctr,cpc,actions,cost_per_action_type',
        'level': 'campaign',
        'sort': '["spend_descending"]',
        'filtering': '[{"field":"spend","operator":"GREATER_THAN","value":0}]'
    })
    sym = 'PHP' if currency == 'PHP' else 'USD'
    if 'data' in data and data['data']:
        for d in data['data']:
            actions = d.get('actions', [])
            costs = d.get('cost_per_action_type', [])
            purchases = find_action(actions, 'purchase', 'omni_purchase')
            cost_pur  = find_cost(costs, 'purchase', 'omni_purchase')
            lpv       = find_action(actions, 'landing_page_view')
            cost_lpv  = find_cost(costs, 'landing_page_view')
            v3        = int(find_action(actions, 'video_view'))
            impr      = int(d.get('impressions', 0)) if 'impressions' in d else 0
            hook      = f"{v3 / impr * 100:.1f}%" if impr > 0 else 'N/A'
            print(f"    - {d['campaign_name']}")
            print(f"      Spend: {sym} {float(d.get('spend', 0)):,.2f} | Clicks: {d.get('clicks', 0)} | CTR: {float(d.get('ctr', 0)):.2f}%")
            print(f"      Hook: {hook} | LP Views: {lpv} | Cost/LPV: {cost_lpv}")
            print(f"      Purchases: {purchases} | Cost/Purchase: {cost_pur}")

if __name__ == '__main__':
    accounts = get_active_accounts()
    print(f"\n{'='*55}")
    print(f"  META ADS REPORT - {DATE_LABEL.upper()}")
    print(f"  Active accounts found: {len(accounts)}")
    print(f"{'='*55}")

    for acc in accounts:
        print(f"\n[ {acc['name']} ] ({acc['currency']})")
        print(f"  Account ID: {acc['id']}")
        account_overview(acc['id'], acc['currency'])
        print(f"\n  Campaigns:")
        campaign_breakdown(acc['id'], acc['currency'])
        print()
