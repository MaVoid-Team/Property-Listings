# frozen_string_literal: true

class JsonFailureApp < Devise::FailureApp
  def respond
    # For API-only apps, always return JSON instead of redirecting
    if json_request?
      json_error_response
    else
      super
    end
  end

  def json_error_response
    self.status = 401
    self.content_type = 'application/json'
    self.response_body = {
      error: 'Unauthorized',
      message: i18n_message
    }.to_json
  end

  def store_location!
    # Skip storing location for API-only apps without sessions
    # This prevents the DisabledSessionError
  end

  def redirect
    # For JSON requests, don't redirect, just return JSON
    if json_request?
      json_error_response
    else
      super
    end
  end

  private

  def json_request?
    # Check if request accepts JSON or is an API request
    request.format.json? || 
      request.headers['Accept']&.include?('application/json') ||
      request.path.start_with?('/v1/', '/api/')
  end
end

