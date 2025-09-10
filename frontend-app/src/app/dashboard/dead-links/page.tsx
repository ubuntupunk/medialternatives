'use client';

import React, { useState, useEffect } from 'react';
import { DeadLink, LinkCheckResult } from '@/utils/deadLinkChecker';
import { 
  NotificationSettings, 
  loadNotificationSettings, 
  saveNotificationSettings,
  requestNotificationPermission,
  processNotifications
} from '@/utils/notifications';
import {
  ScheduleSettings,
  loadScheduleSettings,
  saveScheduleSettings,
  formatNextRun
} from '@/utils/scheduler';
import {
  ExportOptions,
  getDefaultExportOptions,
  exportDeadLinks
} from '@/utils/exportUtils';

interface CheckResult {
  type: 'single_post' | 'multiple_posts';
  deadLinks?: DeadLink[];
  result?: LinkCheckResult;
  summary: any;
  recommendations?: string[];
  post?: {
    id: number;
    title: string;
    slug: string;
  };
  postsChecked?: number;
}

export default function DeadLinksPage() {
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<CheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkType, setCheckType] = useState<'recent' | 'specific' | 'all'>('recent');
  const [postId, setPostId] = useState('');
  const [postsCount, setPostsCount] = useState('5');
  
  // New state for features
  const [activeTab, setActiveTab] = useState<'check' | 'schedule' | 'notifications' | 'export'>('check');
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(loadNotificationSettings());
  const [scheduleSettings, setScheduleSettings] = useState<ScheduleSettings>(loadScheduleSettings());
  const [exportOptions, setExportOptions] = useState<ExportOptions>(getDefaultExportOptions());
  const [scheduledChecks, setScheduledChecks] = useState<any[]>([]);
  
  // Progress tracking state
  const [progress, setProgress] = useState<{
    current: number;
    total: number;
    percentage: number;
    currentItem?: string;
    show: boolean;
  }>({ current: 0, total: 0, percentage: 0, show: false });

  // Load scheduled checks on component mount
  useEffect(() => {
    loadScheduledChecks();
  }, []);

  const checkDeadLinks = async () => {
    setIsChecking(true);
    setError(null);
    setResults(null);
    setProgress({ current: 0, total: 0, percentage: 0, show: true });

    try {
      let url = '/api/check-dead-links';
      const params = new URLSearchParams();

      if (checkType === 'specific' && postId) {
        params.append('post_id', postId);
      } else if (checkType === 'all') {
        params.append('all', 'true');
      } else {
        params.append('posts', postsCount);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      // Start progress tracking
      const startTime = Date.now();
      let progressInterval: NodeJS.Timeout;

      // Simulate progress for API calls (since we can't track server-side progress directly)
      if (checkType !== 'specific') {
        const estimatedLinks = checkType === 'all' ? 100 : parseInt(postsCount) * 5; // Rough estimate
        let currentProgress = 0;
        
        progressInterval = setInterval(() => {
          currentProgress += Math.random() * 2; // Simulate progress
          if (currentProgress < 90) { // Don't go to 100% until we get results
            setProgress(prev => ({
              ...prev,
              current: Math.floor(currentProgress),
              total: 100,
              percentage: Math.floor(currentProgress),
              currentItem: 'Checking links...'
            }));
          }
        }, 500);
      }

      const response = await fetch(url);
      const data = await response.json();

      // Clear progress simulation
      if (progressInterval!) {
        clearInterval(progressInterval);
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check dead links');
      }

      // Complete progress
      setProgress({
        current: 100,
        total: 100,
        percentage: 100,
        currentItem: 'Completed',
        show: true
      });

      setResults(data);
      
      // Process notifications if enabled
      await processNotifications(data, notificationSettings);
      
      // Hide progress after 2 seconds
      setTimeout(() => {
        setProgress(prev => ({ ...prev, show: false }));
      }, 2000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setProgress(prev => ({ ...prev, show: false }));
    } finally {
      setIsChecking(false);
    }
  };

  // Load scheduled checks
  const loadScheduledChecks = async () => {
    try {
      const response = await fetch('/api/scheduled-checks');
      if (response.ok) {
        const data = await response.json();
        setScheduledChecks(data.checks || []);
      }
    } catch (error) {
      console.error('Failed to load scheduled checks:', error);
    }
  };

  // Save notification settings
  const handleNotificationSettingsChange = (newSettings: NotificationSettings) => {
    setNotificationSettings(newSettings);
    saveNotificationSettings(newSettings);
  };

  // Save schedule settings
  const handleScheduleSettingsChange = async (newSettings: ScheduleSettings) => {
    setScheduleSettings(newSettings);
    saveScheduleSettings(newSettings);
    
    try {
      await fetch('/api/scheduled-checks/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
    } catch (error) {
      console.error('Failed to save schedule settings:', error);
    }
  };

  // Request notification permission
  const handleRequestNotificationPermission = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      handleNotificationSettingsChange({
        ...notificationSettings,
        enableBrowserNotifications: true
      });
    }
  };

  // Export results
  const handleExport = () => {
    if (!results) return;
    
    const deadLinks = results.deadLinks || results.result?.deadLinks || [];
    exportDeadLinks(deadLinks, results.summary, exportOptions);
  };

  const getStatusBadgeClass = (status: number | null) => {
    if (status === null) return 'bg-secondary';
    if (status >= 500) return 'bg-danger';
    if (status >= 400) return 'bg-warning';
    return 'bg-success';
  };

  const formatProcessingTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${Math.round(ms / 1000)}s`;
    return `${Math.round(ms / 60000 * 100) / 100}m`;
  };

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="h3 mb-0">Dead Link Checker</h1>
            <div className="d-flex gap-2">
              {results && (
                <button
                  className="btn btn-outline-success btn-sm"
                  onClick={handleExport}
                  title="Export Results"
                >
                  <i className="bi bi-download"></i> Export
                </button>
              )}
              <div className="text-muted">
                <small>Check for broken external links in your posts</small>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'check' ? 'active' : ''}`}
                onClick={() => setActiveTab('check')}
              >
                <i className="bi bi-search"></i> Check Links
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'schedule' ? 'active' : ''}`}
                onClick={() => setActiveTab('schedule')}
              >
                <i className="bi bi-calendar-check"></i> Schedule
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'notifications' ? 'active' : ''}`}
                onClick={() => setActiveTab('notifications')}
              >
                <i className="bi bi-bell"></i> Notifications
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'export' ? 'active' : ''}`}
                onClick={() => setActiveTab('export')}
              >
                <i className="bi bi-file-earmark-arrow-down"></i> Export
              </button>
            </li>
          </ul>

          {/* Tab Content */}
          {activeTab === 'check' && (
            <>
              {/* Configuration Panel */}
              <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">Check Configuration</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4">
                  <label className="form-label">Check Type</label>
                  <select 
                    className="form-select"
                    value={checkType}
                    onChange={(e) => setCheckType(e.target.value as any)}
                    disabled={isChecking}
                  >
                    <option value="recent">Recent Posts</option>
                    <option value="specific">Specific Post</option>
                    <option value="all">All Posts (Slow)</option>
                  </select>
                </div>

                {checkType === 'specific' && (
                  <div className="col-md-4">
                    <label className="form-label">Post ID</label>
                    <input
                      type="number"
                      className="form-control"
                      value={postId}
                      onChange={(e) => setPostId(e.target.value)}
                      placeholder="Enter post ID"
                      disabled={isChecking}
                    />
                  </div>
                )}

                {checkType === 'recent' && (
                  <div className="col-md-4">
                    <label className="form-label">Number of Posts</label>
                    <select
                      className="form-select"
                      value={postsCount}
                      onChange={(e) => setPostsCount(e.target.value)}
                      disabled={isChecking}
                    >
                      <option value="5">5 posts</option>
                      <option value="10">10 posts</option>
                      <option value="15">15 posts</option>
                      <option value="20">20 posts</option>
                    </select>
                  </div>
                )}

                <div className="col-md-4 d-flex align-items-end">
                  <button
                    className="btn btn-primary"
                    onClick={checkDeadLinks}
                    disabled={isChecking || (checkType === 'specific' && !postId)}
                  >
                    {isChecking ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Checking...
                      </>
                    ) : (
                      'Check Dead Links'
                    )}
                  </button>
                </div>
              </div>

              {checkType === 'all' && (
                <div className="alert alert-warning mt-3">
                  <strong>Warning:</strong> Checking all posts may take several minutes and consume API resources.
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {progress.show && (
            <div className="card mb-4">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="mb-0">Checking Links Progress</h6>
                  <span className="text-muted">{progress.percentage}%</span>
                </div>
                <div className="progress mb-2" style={{ height: '8px' }}>
                  <div 
                    className="progress-bar progress-bar-striped progress-bar-animated" 
                    role="progressbar" 
                    style={{ width: `${progress.percentage}%` }}
                    aria-valuenow={progress.percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  ></div>
                </div>
                {progress.currentItem && (
                  <small className="text-muted">
                    <i className="bi bi-link-45deg me-1"></i>
                    {progress.currentItem}
                  </small>
                )}
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="alert alert-danger">
              <strong>Error:</strong> {error}
              {error.includes('Forbidden') && (
                <div className="mt-2">
                  <small>
                    <strong>Tip:</strong> Some websites block automated requests. This is normal and doesn&apos;t indicate a broken link for human visitors.
                  </small>
                </div>
              )}
              {error.includes('CORS') && (
                <div className="mt-2">
                  <small>
                    <strong>Tip:</strong> CORS errors occur when checking from the browser. The link may work fine for visitors.
                  </small>
                </div>
              )}
            </div>
          )}

          {/* Results Display */}
          {results && (
            <div className="row">
              {/* Summary Card */}
              <div className="col-12 mb-4">
                <div className="card">
                  <div className="card-header">
                    <h5 className="card-title mb-0">
                      {results.type === 'single_post' ? 'Single Post Results' : 'Multiple Posts Results'}
                    </h5>
                  </div>
                  <div className="card-body">
                    {results.type === 'single_post' && results.post && (
                      <div className="mb-3">
                        <h6>Post: {results.post.title}</h6>
                        <p className="text-muted">ID: {results.post.id} | Slug: {results.post.slug}</p>
                      </div>
                    )}

                    <div className="row">
                      {results.type === 'multiple_posts' && (
                        <>
                          <div className="col-md-2">
                            <div className="text-center">
                              <div className="h4 text-primary">{results.summary.totalPosts}</div>
                              <div className="text-muted small">Posts Checked</div>
                            </div>
                          </div>
                          <div className="col-md-2">
                            <div className="text-center">
                              <div className="h4 text-info">{results.summary.totalLinks}</div>
                              <div className="text-muted small">Total Links</div>
                            </div>
                          </div>
                          <div className="col-md-2">
                            <div className="text-center">
                              <div className="h4 text-success">{results.summary.workingLinks}</div>
                              <div className="text-muted small">Working Links</div>
                            </div>
                          </div>
                        </>
                      )}
                      <div className="col-md-2">
                        <div className="text-center">
                          <div className={`h4 ${results.summary.totalDeadLinks || results.summary.deadLinks > 0 ? 'text-danger' : 'text-success'}`}>
                            {results.summary.totalDeadLinks || results.summary.deadLinks || 0}
                          </div>
                          <div className="text-muted small">Dead Links</div>
                        </div>
                      </div>
                      {results.type === 'multiple_posts' && results.summary.processingTimeMs && (
                        <div className="col-md-2">
                          <div className="text-center">
                            <div className="h4 text-secondary">{formatProcessingTime(results.summary.processingTimeMs)}</div>
                            <div className="text-muted small">Processing Time</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Error Analysis */}
                    {results.result && (results.result.forbiddenErrors > 0 || results.result.timeoutErrors > 0 || results.result.retryableErrors > 0) && (
                      <div className="mt-4">
                        <h6>Error Analysis:</h6>
                        <div className="row">
                          {results.result.forbiddenErrors > 0 && (
                            <div className="col-md-4">
                              <div className="text-center">
                                <div className="h5 text-warning">{results.result.forbiddenErrors}</div>
                                <div className="text-muted small">Forbidden (403)</div>
                                <small className="text-muted d-block">Sites blocking bots</small>
                              </div>
                            </div>
                          )}
                          {results.result.timeoutErrors > 0 && (
                            <div className="col-md-4">
                              <div className="text-center">
                                <div className="h5 text-info">{results.result.timeoutErrors}</div>
                                <div className="text-muted small">Timeouts</div>
                                <small className="text-muted d-block">Slow responses</small>
                              </div>
                            </div>
                          )}
                          {results.result.retryableErrors > 0 && (
                            <div className="col-md-4">
                              <div className="text-center">
                                <div className="h5 text-secondary">{results.result.retryableErrors}</div>
                                <div className="text-muted small">Retryable</div>
                                <small className="text-muted d-block">Temporary issues</small>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Recommendations */}
                    {results.recommendations && results.recommendations.length > 0 && (
                      <div className="mt-4">
                        <h6>Recommendations:</h6>
                        <ul className="list-unstyled">
                          {results.recommendations.map((rec, index) => (
                            <li key={index} className="mb-1">
                              <small>{rec}</small>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Dead Links List */}
              {(results.deadLinks || results.result?.deadLinks) && (results.deadLinks?.length || results.result?.deadLinks.length) > 0 && (
                <div className="col-12">
                  <div className="card">
                    <div className="card-header">
                      <h5 className="card-title mb-0">Dead Links Found</h5>
                    </div>
                    <div className="card-body">
                      <div className="table-responsive">
                        <table className="table table-sm">
                          <thead>
                            <tr>
                              <th>URL</th>
                              <th>Status</th>
                              <th>Post</th>
                              <th>Context</th>
                              <th>Archive</th>
                              <th>Suggestions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(results.deadLinks || results.result?.deadLinks || []).map((link, index) => (
                              <tr key={index}>
                                <td>
                                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-break">
                                    {link.url.length > 50 ? `${link.url.substring(0, 50)}...` : link.url}
                                  </a>
                                </td>
                                <td>
                                  <span className={`badge ${getStatusBadgeClass(link.status)}`}>
                                    {link.status || 'Timeout/Error'}
                                  </span>
                                  {link.retryable && (
                                    <span className="badge bg-info ms-1" title="This error might be temporary">
                                      <i className="bi bi-arrow-clockwise"></i>
                                    </span>
                                  )}
                                  {link.error && (
                                    <div className="small text-muted">{link.error}</div>
                                  )}
                                  {link.checkedAt && (
                                    <div className="small text-muted">
                                      Checked: {new Date(link.checkedAt).toLocaleString()}
                                    </div>
                                  )}
                                </td>
                                <td>
                                  <a href={`/${link.postSlug}`} target="_blank" className="text-decoration-none">
                                    {link.postTitle.length > 30 ? `${link.postTitle.substring(0, 30)}...` : link.postTitle}
                                  </a>
                                </td>
                                <td>
                                  <small className="text-muted">
                                    {link.context.length > 100 ? `${link.context.substring(0, 100)}...` : link.context}
                                  </small>
                                </td>
                                <td>
                                  {link.archiveUrl && (
                                    <a href={link.archiveUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-secondary">
                                      Archive
                                    </a>
                                  )}
                                </td>
                                <td>
                                  {link.suggestions && link.suggestions.length > 0 && (
                                    <div className="small">
                                      {link.suggestions[0].length > 50 ? `${link.suggestions[0].substring(0, 50)}...` : link.suggestions[0]}
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* No Dead Links Found */}
              {((results.deadLinks && results.deadLinks.length === 0) || (results.result?.deadLinks && results.result.deadLinks.length === 0)) && (
                <div className="col-12">
                  <div className="alert alert-success">
                    <h5>🎉 No Dead Links Found!</h5>
                    <p className="mb-0">All external links in the checked posts are working properly.</p>
                  </div>
                </div>
              )}
            </div>
          )}
          </>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Scheduled Checks</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h6>Schedule Settings</h6>
                  <div className="mb-3">
                    <label className="form-label">Enable Scheduled Checks</label>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={scheduleSettings.enabled}
                        onChange={(e) => handleScheduleSettingsChange({
                          ...scheduleSettings,
                          enabled: e.target.checked
                        })}
                      />
                      <label className="form-check-label">
                        Automatically check for dead links
                      </label>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Frequency</label>
                    <select
                      className="form-select"
                      value={scheduleSettings.frequency}
                      onChange={(e) => handleScheduleSettingsChange({
                        ...scheduleSettings,
                        frequency: e.target.value as any
                      })}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Time</label>
                    <input
                      type="time"
                      className="form-control"
                      value={scheduleSettings.time}
                      onChange={(e) => handleScheduleSettingsChange({
                        ...scheduleSettings,
                        time: e.target.value
                      })}
                    />
                  </div>

                  {scheduleSettings.frequency === 'weekly' && (
                    <div className="mb-3">
                      <label className="form-label">Day of Week</label>
                      <select
                        className="form-select"
                        value={scheduleSettings.dayOfWeek || 1}
                        onChange={(e) => handleScheduleSettingsChange({
                          ...scheduleSettings,
                          dayOfWeek: parseInt(e.target.value)
                        })}
                      >
                        <option value={0}>Sunday</option>
                        <option value={1}>Monday</option>
                        <option value={2}>Tuesday</option>
                        <option value={3}>Wednesday</option>
                        <option value={4}>Thursday</option>
                        <option value={5}>Friday</option>
                        <option value={6}>Saturday</option>
                      </select>
                    </div>
                  )}

                  {scheduleSettings.frequency === 'monthly' && (
                    <div className="mb-3">
                      <label className="form-label">Day of Month</label>
                      <input
                        type="number"
                        className="form-control"
                        min="1"
                        max="31"
                        value={scheduleSettings.dayOfMonth || 1}
                        onChange={(e) => handleScheduleSettingsChange({
                          ...scheduleSettings,
                          dayOfMonth: parseInt(e.target.value)
                        })}
                      />
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label">Posts to Check</label>
                    <input
                      type="number"
                      className="form-control"
                      min="1"
                      max="50"
                      value={scheduleSettings.postsToCheck}
                      onChange={(e) => handleScheduleSettingsChange({
                        ...scheduleSettings,
                        postsToCheck: parseInt(e.target.value)
                      })}
                    />
                  </div>

                  <div className="alert alert-info">
                    <strong>Next Run:</strong> {formatNextRun(scheduleSettings)}
                  </div>
                </div>

                <div className="col-md-6">
                  <h6>Recent Scheduled Checks</h6>
                  {scheduledChecks.length === 0 ? (
                    <p className="text-muted">No scheduled checks yet.</p>
                  ) : (
                    <div className="list-group">
                      {scheduledChecks.slice(0, 5).map((check) => (
                        <div key={check.id} className="list-group-item">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <span className={`badge ${
                                check.status === 'completed' ? 'bg-success' :
                                check.status === 'failed' ? 'bg-danger' :
                                check.status === 'running' ? 'bg-warning' : 'bg-secondary'
                              }`}>
                                {check.status}
                              </span>
                              <small className="text-muted ms-2">
                                {new Date(check.timestamp).toLocaleString()}
                              </small>
                            </div>
                            {check.results && (
                              <small>
                                {check.results.summary.deadLinks} dead links found
                              </small>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Notification Settings</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h6>Browser Notifications</h6>
                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={notificationSettings.enableBrowserNotifications}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleRequestNotificationPermission();
                          } else {
                            handleNotificationSettingsChange({
                              ...notificationSettings,
                              enableBrowserNotifications: false
                            });
                          }
                        }}
                      />
                      <label className="form-check-label">
                        Enable browser notifications
                      </label>
                    </div>
                    <small className="text-muted">
                      Get instant notifications when dead links are found
                    </small>
                  </div>

                  <h6>Email Notifications</h6>
                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={notificationSettings.enableEmailNotifications}
                        onChange={(e) => handleNotificationSettingsChange({
                          ...notificationSettings,
                          enableEmailNotifications: e.target.checked
                        })}
                      />
                      <label className="form-check-label">
                        Enable email notifications
                      </label>
                    </div>
                  </div>

                  {notificationSettings.enableEmailNotifications && (
                    <div className="mb-3">
                      <label className="form-label">Email Address</label>
                      <input
                        type="email"
                        className="form-control"
                        value={notificationSettings.email || ''}
                        onChange={(e) => handleNotificationSettingsChange({
                          ...notificationSettings,
                          email: e.target.value
                        })}
                        placeholder="your@email.com"
                      />
                    </div>
                  )}

                  <h6>Webhook Notifications</h6>
                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={notificationSettings.enableWebhookNotifications}
                        onChange={(e) => handleNotificationSettingsChange({
                          ...notificationSettings,
                          enableWebhookNotifications: e.target.checked
                        })}
                      />
                      <label className="form-check-label">
                        Enable webhook notifications
                      </label>
                    </div>
                  </div>

                  {notificationSettings.enableWebhookNotifications && (
                    <div className="mb-3">
                      <label className="form-label">Webhook URL</label>
                      <input
                        type="url"
                        className="form-control"
                        value={notificationSettings.webhookUrl || ''}
                        onChange={(e) => handleNotificationSettingsChange({
                          ...notificationSettings,
                          webhookUrl: e.target.value
                        })}
                        placeholder="https://your-webhook-url.com"
                      />
                      <small className="text-muted">
                        Slack, Discord, or custom webhook URL
                      </small>
                    </div>
                  )}
                </div>

                <div className="col-md-6">
                  <h6>Notification Threshold</h6>
                  <div className="mb-3">
                    <label className="form-label">Minimum Dead Links</label>
                    <input
                      type="number"
                      className="form-control"
                      min="1"
                      value={notificationSettings.threshold}
                      onChange={(e) => handleNotificationSettingsChange({
                        ...notificationSettings,
                        threshold: parseInt(e.target.value)
                      })}
                    />
                    <small className="text-muted">
                      Only notify when this many or more dead links are found
                    </small>
                  </div>

                  <div className="alert alert-info">
                    <h6>Test Notifications</h6>
                    <p className="mb-2">Send a test notification to verify your settings:</p>
                    <button 
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => {
                        // Send test notification
                        if (notificationSettings.enableBrowserNotifications) {
                          new Notification('Dead Link Checker Test', {
                            body: 'Test notification from MediaAlternatives',
                            icon: '/images/favicon-32x32.png'
                          });
                        }
                      }}
                    >
                      Test Browser Notification
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Export Tab */}
        {activeTab === 'export' && (
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Export Options</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h6>Export Format</h6>
                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="exportFormat"
                        value="csv"
                        checked={exportOptions.format === 'csv'}
                        onChange={(e) => setExportOptions({
                          ...exportOptions,
                          format: e.target.value as any
                        })}
                      />
                      <label className="form-check-label">
                        CSV (Comma Separated Values)
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="exportFormat"
                        value="json"
                        checked={exportOptions.format === 'json'}
                        onChange={(e) => setExportOptions({
                          ...exportOptions,
                          format: e.target.value as any
                        })}
                      />
                      <label className="form-check-label">
                        JSON (JavaScript Object Notation)
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="exportFormat"
                        value="pdf"
                        checked={exportOptions.format === 'pdf'}
                        onChange={(e) => setExportOptions({
                          ...exportOptions,
                          format: e.target.value as any
                        })}
                      />
                      <label className="form-check-label">
                        PDF (Portable Document Format)
                      </label>
                    </div>
                  </div>

                  <h6>Include Data</h6>
                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={exportOptions.includeContext}
                        onChange={(e) => setExportOptions({
                          ...exportOptions,
                          includeContext: e.target.checked
                        })}
                      />
                      <label className="form-check-label">
                        Include context text
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={exportOptions.includeSuggestions}
                        onChange={(e) => setExportOptions({
                          ...exportOptions,
                          includeSuggestions: e.target.checked
                        })}
                      />
                      <label className="form-check-label">
                        Include suggestions
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={exportOptions.includeArchiveLinks}
                        onChange={(e) => setExportOptions({
                          ...exportOptions,
                          includeArchiveLinks: e.target.checked
                        })}
                      />
                      <label className="form-check-label">
                        Include archive links
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={exportOptions.groupByPost}
                        onChange={(e) => setExportOptions({
                          ...exportOptions,
                          groupByPost: e.target.checked
                        })}
                      />
                      <label className="form-check-label">
                        Group by post (JSON only)
                      </label>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <h6>Export Preview</h6>
                  <div className="alert alert-light">
                    <strong>Format:</strong> {exportOptions.format.toUpperCase()}<br/>
                    <strong>Includes:</strong>
                    <ul className="mb-0 mt-1">
                      <li>URL and status code</li>
                      <li>Post information</li>
                      {exportOptions.includeContext && <li>Context text</li>}
                      {exportOptions.includeSuggestions && <li>Fix suggestions</li>}
                      {exportOptions.includeArchiveLinks && <li>Archive links</li>}
                      {exportOptions.groupByPost && exportOptions.format === 'json' && <li>Grouped by post</li>}
                    </ul>
                  </div>

                  {results && (
                    <button
                      className="btn btn-primary"
                      onClick={handleExport}
                    >
                      <i className="bi bi-download"></i> Export Results
                    </button>
                  )}

                  {!results && (
                    <div className="alert alert-warning">
                      Run a dead link check first to export results.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}