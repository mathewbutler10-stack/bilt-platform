# BILT Platform - Deployment Rollback Plan

## 🚨 **ROLLBACK STRATEGY OVERVIEW**

**Purpose:** Provide clear procedures for rolling back deployments in case of critical failures
**Activation Criteria:** Platform instability, data corruption, security breaches, or performance degradation
**Rollback Time Estimate:** 15-30 minutes depending on failure severity
**Primary Responsibility:** Alfred (AI Assistant) with Mat's approval for production rollbacks

## 📋 **ROLLBACK SCENARIOS**

### **Scenario 1: Deployment Failure (Build/Deploy Phase)**
- **Symptoms:** Build fails, deployment doesn't complete, platform inaccessible
- **Root Causes:** Configuration errors, dependency issues, platform quotas
- **Rollback Action:** Revert to previous working version
- **Time Estimate:** 5-10 minutes

### **Scenario 2: Platform Instability (Post-Deployment)**
- **Symptoms:** High error rates, slow response times, service interruptions
- **Root Causes:** Code bugs, database performance issues, resource constraints
- **Rollback Action:** Rollback to stable version + database restore if needed
- **Time Estimate:** 10-20 minutes

### **Scenario 3: Data Corruption or Loss**
- **Symptoms:** Missing data, incorrect calculations, database errors
- **Root Causes:** Buggy migrations, application logic errors, manual data changes
- **Rollback Action:** Database restore from backup + application rollback
- **Time Estimate:** 20-30 minutes

### **Scenario 4: Security Breach or Vulnerability**
- **Symptoms:** Unauthorized access, data exposure, security alerts
- **Root Causes:** Security misconfiguration, vulnerable dependencies
- **Rollback Action:** Immediate platform shutdown + security patch deployment
- **Time Estimate:** 15-25 minutes

## 🛠️ **ROLLBACK PROCEDURES**

### **For Railway Deployments:**

#### **Option A: Quick Rollback (Previous Version)**
```bash
# Check deployment history
railway deployments

# Rollback to specific deployment
railway rollback <deployment-id>

# Verify rollback success
railway logs --follow
```

#### **Option B: Redeploy Previous Working Version**
```bash
# Deploy from specific git commit
railway deploy --service bilt --detach <commit-sha>

# Or deploy from specific branch/tag
railway deploy --service bilt --detach production-v1.0.0
```

### **For Vercel Deployments:**

#### **Option A: Vercel Dashboard Rollback**
1. Navigate to Vercel Dashboard → BILT project → Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"
4. Verify domain updates to previous version

#### **Option B: CLI Rollback**
```bash
# List deployments
vercel ls bilt

# Rollback to specific deployment
vercel rollback <deployment-id>

# Or promote specific deployment
vercel promote <deployment-id> --prod
```

### **For Database Rollbacks (Supabase):**

#### **Option A: Migration Rollback**
```sql
-- Check migration history
SELECT * FROM supabase_migrations.schema_migrations ORDER BY version DESC;

-- Manually revert specific migration
-- (Requires writing reverse migration SQL)
```

#### **Option B: Point-in-Time Recovery**
```sql
-- Restore database to specific timestamp
-- (Requires Supabase backup configuration)
-- Contact Supabase support for assistance
```

#### **Option C: Data Export/Import**
```bash
# Export current data before rollback
pg_dump -h db-host -U postgres -d bilt_prod > backup_before_rollback.sql

# Import previous backup if needed
psql -h db-host -U postgres -d bilt_prod < previous_backup.sql
```

## 📊 **PRE-DEPLOYMENT CHECKLIST**

### **Before Any Deployment:**
1. ✅ **Database backup** created and verified
2. ✅ **Current deployment** documented (version, commit, timestamp)
3. ✅ **Rollback procedures** tested in staging environment
4. ✅ **Team communication** plan established
5. ✅ **Monitoring alerts** configured for post-deployment

### **Backup Strategy:**
- **Database:** Daily automated backups + pre-deployment snapshots
- **Application:** Git tags for each production release
- **Configuration:** Environment variables documented and backed up
- **Data:** Critical user data exported before major changes

## 🚦 **ROLLBACK DECISION MATRIX**

### **Automatic Rollback Triggers:**
- ❌ **Health check failures** for >5 minutes
- ❌ **Error rate** >10% for >10 minutes
- ❌ **Database connection** failures
- ❌ **Critical functionality** broken (auth, payments, etc.)

### **Manual Rollback Triggers (Requires Approval):**
- ⚠️ **Performance degradation** >50% from baseline
- ⚠️ **User reports** of broken features
- ⚠️ **Security vulnerabilities** discovered
- ⚠️ **Data inconsistency** or corruption

### **No Rollback Required:**
- ✅ **Minor UI issues** that don't affect functionality
- ✅ **Performance variations** within acceptable range
- ✅ **Non-critical features** temporarily unavailable
- ✅ **Scheduled maintenance** windows

## 🔧 **ROLLBACK EXECUTION STEPS**

### **Step 1: Assessment (2-5 minutes)**
1. **Identify issue severity** and impact
2. **Determine root cause** if possible
3. **Check if hotfix** is faster than rollback
4. **Notify stakeholders** of impending rollback

### **Step 2: Preparation (2-5 minutes)**
1. **Verify backup availability** and integrity
2. **Document current state** for post-mortem
3. **Prepare rollback commands** and verify access
4. **Set maintenance mode** if applicable

### **Step 3: Execution (5-15 minutes)**
1. **Execute rollback procedures** based on scenario
2. **Monitor rollback progress** and verify each step
3. **Test critical functionality** after rollback
4. **Verify data integrity** and consistency

### **Step 4: Verification (5-10 minutes)**
1. **Run health checks** and smoke tests
2. **Monitor error rates** and performance metrics
3. **Validate user functionality** with test accounts
4. **Communicate resolution** to stakeholders

### **Step 5: Post-Rollback (15-30 minutes)**
1. **Conduct post-mortem analysis** of failure
2. **Document lessons learned** and improvements
3. **Schedule fix deployment** with corrected code
4. **Update rollback procedures** based on experience

## 📈 **MONITORING & ALERTING**

### **Pre-Rollback Monitoring:**
- **Health checks:** `/api/health` endpoint status
- **Error rates:** Application and database errors
- **Performance:** Response times, throughput, resource usage
- **Business metrics:** User activity, transaction success rates

### **Post-Rollback Verification:**
- ✅ **All health checks** passing
- ✅ **Error rates** returned to normal levels
- ✅ **Critical user journeys** working
- ✅ **Data consistency** verified
- ✅ **Performance metrics** within acceptable ranges

### **Alert Channels:**
- **Primary:** WhatsApp to Mat (+61448843355)
- **Secondary:** Email notifications
- **Tertiary:** Platform-specific alerts (Railway/Vercel)
- **Emergency:** Direct system intervention if automated

## 🧪 **ROLLBACK TESTING PROCEDURE**

### **Testing Frequency:**
- **Monthly:** Test rollback procedures in staging
- **Quarterly:** Full rollback simulation with team
- **Pre-major-release:** Specific rollback scenario testing
- **Post-incident:** Update procedures based on real experience

### **Test Scenarios:**
1. **Deployment failure** simulation
2. **Database corruption** recovery test
3. **Security incident** response drill
4. **Performance degradation** rollback exercise

### **Success Criteria:**
- Rollback completes within estimated time
- All critical functionality restored
- No data loss during rollback
- Team communication effective throughout

## 📚 **DOCUMENTATION & COMMUNICATION**

### **Rollback Documentation:**
- **This plan** kept up-to-date with current procedures
- **Runbooks** for specific failure scenarios
- **Contact lists** for stakeholders and team members
- **Post-mortem templates** for incident analysis

### **Communication Plan:**
- **Internal:** Alfred → Mat (immediate notification)
- **Users:** Status page updates for extended outages
- **Team:** Post-mortem reports and improvement tracking
- **Stakeholders:** Summary reports for business impact

### **Status Page:**
- **Platform status:** Operational/Degraded/Maintenance/Outage
- **Incident updates:** Regular updates during rollback
- **Resolution ETA:** Estimated time to restore service
- **Post-incident report:** Detailed analysis after resolution

## 🔄 **CONTINUOUS IMPROVEMENT**

### **Post-Rollback Analysis:**
1. **Root cause analysis** of the failure
2. **Rollback effectiveness** evaluation
3. **Procedure improvements** identification
4. **Preventive measures** implementation

### **Metrics Tracking:**
- **MTTR (Mean Time To Recovery):** Target <30 minutes
- **Rollback success rate:** Target >95%
- **Incident frequency:** Track and reduce over time
- **User impact duration:** Minimize service disruption

### **Procedure Updates:**
- **Monthly review** of rollback procedures
- **Quarterly updates** based on lessons learned
- **Annual comprehensive review** of entire strategy
- **Ad-hoc updates** after significant platform changes

---

**ROLLBACK PLAN STATUS:** ✅ **READY FOR DEPLOYMENT**
**LAST TESTED:** Not yet tested (awaiting first deployment)
**NEXT SCHEDULED TEST:** After first production deployment
**PRIMARY CONTACT:** Alfred (AI Assistant)
**APPROVAL REQUIRED:** Mat Butler for production rollbacks

**Last Updated:** April 12, 2026 - 9:40 PM AEDT
**Prepared by:** Alfred (AI Assistant)
**Next Action:** Test rollback procedures in staging environment when available