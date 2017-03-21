#!/usr/bin/env python
"""
Licensed to the Apache Software Foundation (ASF) under one
or more contributor license agreements.  See the NOTICE file
distributed with this work for additional information
regarding copyright ownership.  The ASF licenses this file
to you under the Apache License, Version 2.0 (the
"License"); you may not use this file except in compliance
with the License.  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

"""

from resource_management import *
import sys
from ambari_commons.os_family_impl import OsFamilyFuncImpl, OsFamilyImpl
from ambari_commons import OSConst


@OsFamilyFuncImpl(os_family=OSConst.WINSRV_FAMILY)
def hcat():
  import params

  XmlConfig("hive-site.xml",
            conf_dir = params.hive_conf_dir,
            configurations = params.config['configurations']['hive-site'],
            owner=params.hive_user,
            configuration_attributes=params.config['configuration_attributes']['hive-site']
  )


@OsFamilyFuncImpl(os_family=OsFamilyImpl.DEFAULT)
def hcat():
  import params

  from setup_atlas_hive import setup_atlas_hive

  Directory(params.hive_conf_dir,
            recursive=True,
            owner=params.hcat_user,
            group=params.user_group,
  )


  Directory(params.hcat_conf_dir,
            recursive=True,
            owner=params.hcat_user,
            group=params.user_group,
  )

  Directory(params.hcat_pid_dir,
            owner=params.webhcat_user,
            recursive=True
  )

  XmlConfig("hive-site.xml",
            conf_dir=params.hive_client_conf_dir,
            configurations=params.hive_site_config,
            configuration_attributes=params.config['configuration_attributes']['hive-site'],
            owner=params.hive_user,
            group=params.user_group,
            mode=0644)

  File(format("{hcat_conf_dir}/hcat-env.sh"),
       owner=params.hcat_user,
       group=params.user_group,
       content=InlineTemplate(params.hcat_env_sh_template)
  )

  setup_atlas_hive()
