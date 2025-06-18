targetScope = 'resourceGroup'

// Parameters
@description('Specifies the name prefix for all resources.')
param namePrefix string = 'pictibmec'

@description('Specifies the location for all resources.')
param location string = resourceGroup().location

@description('Specifies the environment name (dev, staging, prod).')
param environmentName string = 'dev'

@description('Database administrator login name')
@secure()
param databaseAdminLogin string

@description('Database administrator password')
@secure()
param databaseAdminPassword string

@description('PostgreSQL server version')
@allowed(['11', '12', '13', '14', '15', '16'])
param postgresVersion string = '16'

@description('SKU name for PostgreSQL server')
param skuName string = 'Standard_B1ms'

@description('SKU tier for PostgreSQL server')
@allowed(['Burstable', 'GeneralPurpose', 'MemoryOptimized'])
param skuTier string = 'Burstable'

@description('Storage size in GB')
param storageSizeGB int = 32

@description('Backup retention days')
param backupRetentionDays int = 7

// Variables
var resourceToken = toLower(uniqueString(subscription().id, resourceGroup().id, location))
var postgresServerName = '${namePrefix}-postgres-${environmentName}-${resourceToken}'
var databaseName = '${namePrefix}_db'

// Tags
var commonTags = {
  'azd-env-name': environmentName
  Environment: environmentName
  Project: 'PICTI-IBMEC'
  ManagedBy: 'Bicep'
}

// User Assigned Managed Identity
resource userAssignedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: '${namePrefix}-identity-${environmentName}-${resourceToken}'
  location: location
  tags: commonTags
}

// PostgreSQL Flexible Server
resource postgresServer 'Microsoft.DBforPostgreSQL/flexibleServers@2024-08-01' = {
  name: postgresServerName
  location: location
  tags: commonTags
  sku: {
    name: skuName
    tier: skuTier
  }
  properties: {
    version: postgresVersion
    administratorLogin: databaseAdminLogin
    administratorLoginPassword: databaseAdminPassword
    storage: {
      storageSizeGB: storageSizeGB
      autoGrow: 'Enabled'
      type: 'Premium_LRS'
    }
    backup: {
      backupRetentionDays: backupRetentionDays
      geoRedundantBackup: 'Disabled'
    }
    network: {
      publicNetworkAccess: 'Enabled'
    }
    highAvailability: {
      mode: 'Disabled'
    }
    authConfig: {
      activeDirectoryAuth: 'Disabled'
      passwordAuth: 'Enabled'
    }
  }
  
  // Database
  resource database 'databases@2024-08-01' = {
    name: databaseName
    properties: {
      charset: 'UTF8'
      collation: 'en_US.UTF8'
    }
  }

  // Firewall rule to allow Azure services
  resource firewallRuleAzure 'firewallRules@2024-08-01' = {
    name: 'AllowAzureServices'
    properties: {
      startIpAddress: '0.0.0.0'
      endIpAddress: '0.0.0.0'
    }
  }

  // Firewall rule to allow all IPs (for development - restrict in production)
  resource firewallRuleAll 'firewallRules@2024-08-01' = {
    name: 'AllowAllIPs'
    properties: {
      startIpAddress: '0.0.0.0'
      endIpAddress: '255.255.255.255'
    }
  }
}

// Outputs
output postgresServerName string = postgresServer.name
output postgresServerFqdn string = postgresServer.properties.fullyQualifiedDomainName
output databaseName string = databaseName
output connectionString string = 'postgresql://${databaseAdminLogin}:${databaseAdminPassword}@${postgresServer.properties.fullyQualifiedDomainName}:5432/${databaseName}?sslmode=require'
output userAssignedIdentityId string = userAssignedIdentity.id
output userAssignedIdentityClientId string = userAssignedIdentity.properties.clientId
